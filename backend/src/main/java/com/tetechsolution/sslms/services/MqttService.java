package com.tetechsolution.sslms.services;

import com.tetechsolution.sslms.models.FaultHistory;
import com.tetechsolution.sslms.models.Telemetry;
import com.tetechsolution.sslms.repositories.DeviceRepository;
import com.tetechsolution.sslms.repositories.FaultHistoryRepository;
import com.tetechsolution.sslms.repositories.TelemetryRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.stereotype.Service;

@Service
public class MqttService {

    private final MessageChannel mqttOutboundChannel;
    private final DeviceRepository deviceRepository;
    private final TelemetryRepository telemetryRepository;
    private final FaultHistoryRepository faultRepository;

    public MqttService(@Qualifier("mqttOutboundChannel") MessageChannel mqttOutboundChannel,
                       DeviceRepository deviceRepository,
                       TelemetryRepository telemetryRepository,
                       FaultHistoryRepository faultRepository) {
        this.mqttOutboundChannel = mqttOutboundChannel;
        this.deviceRepository = deviceRepository;
        this.telemetryRepository = telemetryRepository;
        this.faultRepository = faultRepository;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<String> message) {
        String topic = message.getHeaders().get("mqtt_receivedTopic").toString();
        String payload = message.getPayload();
        String deviceId = topic.split("/")[1];
        processIncomingData(deviceId, payload);
    }

    private void processIncomingData(String deviceId, String payload) {
        try {

        JSONObject json = new JSONObject(payload);

        // Use optDouble to prevent crashes if a value is missing
        double voltage = json.optDouble("v", 0.0);
        double current = json.optDouble("c", 0.0);
        double power = json.optDouble("p", 0.0);

        // Match the ESP32 field "r" for relay status
        int rState = json.optInt("r", 0);
        String relayState = (rState == 1) ? "ON" : "OFF";

        // IMPORTANT: Ensure deviceId "device1" exists in your DB first!
        // 1. Save Telemetry
        Telemetry data = new Telemetry(deviceId, voltage, current, power);
        telemetryRepository.save(data);

        // 2. Sync Relay Status
        deviceRepository.updateStatus(deviceId, relayState);

        // 3. Fault Detection based on Wattage
        deviceRepository.findById(deviceId).ifPresent(device -> {
            Double baseline = device.getBaselineWatt();

            if (baseline != null) {
                // Detection: Partial Outage (Low Power)
                // Example: If power drops by more than 10W (one bulb failing or dimming)
                if (power < (baseline - 10.0)) {
                    faultRepository.save(new FaultHistory(deviceId, "Partial Outage (Wattage Drop)", power));
                }

                // Detection: Overpower/Surge
                else if (power > (baseline + 50.0)) {
                    faultRepository.save(new FaultHistory(deviceId, "Overpower Detected", power));
                }
            }
        });
        } catch (Exception e) {
            System.err.println("Error parsing MQTT payload: " + e.getMessage());
        }
    }

    public void sendRelayCommand(String deviceId, String command) {
        String topic = "smart_street/" + deviceId + "/control";
        mqttOutboundChannel.send(MessageBuilder.withPayload(command)
                .setHeader(MqttHeaders.TOPIC, topic).build());

        // Update device status in DB
        deviceRepository.updateStatus(deviceId, command);
    }

    public void triggerManualSync(String deviceId) {
        String topic = "smart_street/" + deviceId + "/control";
        String payload = "GET"; // ESP32 should be programmed to respond to this

        mqttOutboundChannel.send(MessageBuilder.withPayload(payload)
                .setHeader(MqttHeaders.TOPIC, topic).build());
    }
}
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
        JSONObject json = new JSONObject(payload);

        double voltage = json.getDouble("v");
        double current = json.getDouble("c");
        double power = json.getDouble("p"); // Wattage from PZEM-004T
        double energy = json.getDouble("e");
        String relayState = json.getInt("r") == 1 ? "ON" : "OFF";

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
                if (power > (baseline + 50.0)) {
                    faultRepository.save(new FaultHistory(deviceId, "Overpower Detected", power));
                }
            }
        });
    }

    public void sendRelayCommand(String deviceId, String command) {
        String topic = "smart_street/" + deviceId + "/control";
        mqttOutboundChannel.send(MessageBuilder.withPayload(command)
                .setHeader(MqttHeaders.TOPIC, topic).build());

        // Update device status in DB
        deviceRepository.updateStatus(deviceId, command);
    }
}
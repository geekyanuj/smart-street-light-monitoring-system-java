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
        // 1. Parse JSON (Assuming format: {"v":230,"i":10.2,"p":2350})
        JSONObject json = new JSONObject(payload);
        double current = json.getDouble("i");

        // 2. Save Telemetry
        Telemetry data = new Telemetry(deviceId, json.getDouble("v"), current, json.getDouble("p"));
        telemetryRepository.save(data);

        // 3. Fault Detection (0.5A drop check)
        deviceRepository.findById(deviceId).ifPresent(device -> {
            if (current < (device.getBaselineCurrent() - 0.5)) {
                faultRepository.save(new FaultHistory(deviceId, "Partial Outage Detected", current));
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
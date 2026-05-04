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

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class MqttService {

    private final MessageChannel mqttOutboundChannel;
    private final DeviceRepository deviceRepository;
    private final TelemetryRepository telemetryRepository;
    private final FaultHistoryRepository faultRepository;

    // Track pending manual sync requests
    private final Map<String, CompletableFuture<Telemetry>> pendingSyncs = new ConcurrentHashMap<>();

    public MqttService(@Qualifier("mqttOutboundChannel") MessageChannel mqttOutboundChannel,
                       DeviceRepository deviceRepository,
                       TelemetryRepository telemetryRepository,
                       FaultHistoryRepository faultRepository) {
        this.mqttOutboundChannel = mqttOutboundChannel;
        this.deviceRepository = deviceRepository;
        this.telemetryRepository = telemetryRepository;
        this.faultRepository = faultRepository;
    }

    // =========================
    // 🔹 MAIN MQTT HANDLER
    // =========================
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<String> message) {
        try {
            Object topicHeader = message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC);
            if (topicHeader == null) topicHeader = message.getHeaders().get("mqtt_receivedTopic"); // Fallback

            String topic = topicHeader.toString();
            String payload = message.getPayload();

            String[] parts = topic.split("/");
            String deviceId = parts[1];
            String type = parts.length > 2 ? parts[2] : "";

            switch (type) {

                case "data":
                    processIncomingData(deviceId, payload);
                    break;

                case "get":
                    handleDeviceGetRequest(deviceId);
                    break;

                default:
                    System.out.println("Unknown topic type: " + topic);
            }

        } catch (Exception e) {
            System.err.println("Error routing MQTT message: " + e.getMessage());
        }
    }

    // =========================
    // 🔹 HANDLE DEVICE GET (Device → Server)
    // =========================
    private void handleDeviceGetRequest(String deviceId) {

        deviceRepository.findById(deviceId).ifPresent(device -> {
            String state = device.getStatus(); // ON / OFF

            if (state != null) {
                String topic = "sslms/" + deviceId + "/control";

                mqttOutboundChannel.send(
                        MessageBuilder.withPayload(state)
                                .setHeader(MqttHeaders.TOPIC, topic)
                                .setHeader(MqttHeaders.RETAINED, true) // ✅ retained sync
                                .build()
                );

                System.out.println("Sent last state to device: " + state);
            }
        });
    }

    // =========================
    // 🔹 PROCESS TELEMETRY (Device → Server)
    // =========================
    private void processIncomingData(String deviceId, String payload) {
        try {
            JSONObject json = new JSONObject(payload);

            double voltage = json.optDouble("v", 0.0);
            double current = json.optDouble("c", 0.0);
            double power = json.optDouble("p", 0.0);
            int rState = json.optInt("r", 0);

            String relayState = (rState == 1) ? "ON" : "OFF";

            // 1. Save telemetry
            Telemetry data = new Telemetry(deviceId, voltage, current, power);
            Telemetry savedData = telemetryRepository.save(data);

            // 2. Complete pending manual sync (if any)
            CompletableFuture<Telemetry> future = pendingSyncs.remove(deviceId);
            if (future != null) {
                future.complete(savedData);
            }

            // 3. Sync relay state in DB
            deviceRepository.updateStatus(deviceId, relayState);

            // 4. Enforce server truth (IMPORTANT)
            enforceRelayState(deviceId, relayState);

            // 5. Fault detection
            deviceRepository.findById(deviceId).ifPresent(device -> {
                Double baseline = device.getBaselineWatt();

                if (baseline != null) {
                    Double lowerOffset = device.getLowerOffset();
                    Double upperOffset = device.getUpperOffset();

                    double lower = baseline - (lowerOffset != null ? lowerOffset : 0.0);
                    double upper = baseline + (upperOffset != null ? upperOffset : 0.0);

                    if (power < lower) {
                        faultRepository.save(new FaultHistory(deviceId, "Low Power Fault", power));
                    }
                    else if (power > upper) {
                        faultRepository.save(new FaultHistory(deviceId, "Overpower Fault", power));
                    }
                }
            });

        } catch (Exception e) {
            System.err.println("Error parsing payload: " + e.getMessage());
        }
    }

    // =========================
    // 🔹 ENFORCE SERVER STATE
    // =========================
    private void enforceRelayState(String deviceId, String deviceReportedState) {

        deviceRepository.findById(deviceId).ifPresent(device -> {
            String expectedState = device.getStatus();

            if (expectedState != null && !expectedState.equals(deviceReportedState)) {

                String topic = "sslms/" + deviceId + "/control";

                mqttOutboundChannel.send(
                        MessageBuilder.withPayload(expectedState)
                                .setHeader(MqttHeaders.TOPIC, topic)
                                .setHeader(MqttHeaders.RETAINED, true)
                                .build()
                );

                System.out.println("Corrected relay state → " + expectedState);
            }
        });
    }

    // =========================
    // 🔹 SEND RELAY COMMAND (App → Device)
    // =========================
    public void sendRelayCommand(String deviceId, String command) {

        String topic = "sslms/" + deviceId + "/control";

        mqttOutboundChannel.send(
                MessageBuilder.withPayload(command)
                        .setHeader(MqttHeaders.TOPIC, topic)
                        .setHeader(MqttHeaders.RETAINED, true) // ✅ CRITICAL
                        .build()
        );

        deviceRepository.updateStatus(deviceId, command);
    }

    public void broadcastCommand(String command) {
        deviceRepository.findAll().forEach(device -> {
            sendRelayCommand(device.getDeviceId(), command);
        });
    }

    // =========================
    // 🔹 MANUAL SYNC (App → Device)
    // =========================
    public CompletableFuture<Telemetry> triggerManualSync(String deviceId) {

        CompletableFuture<Telemetry> future = new CompletableFuture<>();
        pendingSyncs.put(deviceId, future);

        // 🥉 Request telemetry from device
        String topic = "sslms/" + deviceId + "/get";

        mqttOutboundChannel.send(
                MessageBuilder.withPayload("GET")
                        .setHeader(MqttHeaders.TOPIC, topic)
                        .build()
        );

        return future;
    }
}
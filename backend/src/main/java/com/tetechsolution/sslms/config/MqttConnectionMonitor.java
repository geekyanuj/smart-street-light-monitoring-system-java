package com.tetechsolution.sslms.config;

import org.springframework.context.event.EventListener;
import org.springframework.integration.mqtt.event.MqttConnectionFailedEvent;
import org.springframework.integration.mqtt.event.MqttSubscribedEvent;
import org.springframework.stereotype.Component;

@Component
public class MqttConnectionMonitor {

    @EventListener
    public void handleMqttFailure(MqttConnectionFailedEvent event) {
        System.err.println("************************************************");
        System.err.println("❌ MQTT CONNECTION FAILURE!");
        System.err.println("Reason: " + event.getCause().getMessage());
        System.err.println("The MQTT Broker is not available. Shutting down...");
        System.err.println("************************************************");

        // Exits the program so you don't run a broken service
        System.exit(1);
    }

    @EventListener
    public void handleMqttSubscription(MqttSubscribedEvent event) {
        System.out.println("✅ MQTT: Successfully subscribed to topic: " + event.getMessage());
    }
}
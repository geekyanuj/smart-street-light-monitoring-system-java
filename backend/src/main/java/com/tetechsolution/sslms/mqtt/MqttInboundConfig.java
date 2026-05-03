package com.tetechsolution.sslms.mqtt;

import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;

@ Bean 

    public MessageProducer inbound() {
// Subscribes to all clusters using a wildcard '+'
        MqttPahoMessageDrivenChannelAdapter adapter = new MqttPahoMessageDrivenChannelAdapter("SpringBoot_Consumer", mqttClientFactory(), "streetlight/+/status");

        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1); // Ensure
        // delivery
        // at
        // least
        // once
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public MessageHandler handler() {
        return message -> {
            String payload = message.getPayload().toString();
            String topic = message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC).toString();

// Pass to your Service to save in PostgreSQL and check for faults
            monitoringService.processTelemetry(topic, payload);
        };
    }

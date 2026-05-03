package com.tetechsolution.sslms.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.outbound.MqttPahoMessageHandler;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

@Configuration
public class MqttConfig {

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    // ---------------- MQTT FACTORY ----------------
    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();

        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(60);

        factory.setConnectionOptions(options);
        return factory;
    }

    // ---------------- INPUT CHANNEL ----------------
    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    // ---------------- OUTPUT CHANNEL ----------------
    @Bean(name = "mqttOutboundChannel")
    public MessageChannel mqttOutboundChannel() {
        return new DirectChannel();
    }

    // ---------------- SUBSCRIBER ----------------
    @Bean
    public MessageProducer inbound(MqttPahoClientFactory factory) {

        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        "springSubscriber",
                        factory,
                        "smart_street/+/data"
                );

        adapter.setCompletionTimeout(5000);
        adapter.setConverter(new DefaultPahoMessageConverter());
        adapter.setQos(1);
        adapter.setOutputChannel(mqttInputChannel());

        return adapter;
    }

    // ---------------- PUBLISHER ----------------
    @Bean
    public MessageHandler mqttOutbound(MqttPahoClientFactory factory) {

        MqttPahoMessageHandler handler =
                new MqttPahoMessageHandler("springPublisher", factory);

        handler.setAsync(true);
        handler.setDefaultQos(1);
        handler.setDefaultTopic("smart_street/default/control");

        return handler;
    }
}
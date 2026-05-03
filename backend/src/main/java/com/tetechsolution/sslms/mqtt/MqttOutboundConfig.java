package com.tetechsolution.sslms.mqtt;

@    Bean 

    @ServiceActivator(inputChannel = "mqttOutboundChannel")
    public MessageHandler mqttOutbound() {
        MqttPahoMessageHandler messageHandler = new MqttPahoMessageHandler("SpringBoot_Publisher", mqttClientFactory());
        messageHandler.setAsync(true);
        messageHandler.setDefaultTopic("streetlight/all/control");
        return messageHandler;
    }

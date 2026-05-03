package com.tetechsolution.sslms.config;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class ConnectionChecker implements CommandLineRunner {

    private final DataSource dataSource;

    @Value("${mqtt.broker.url}")
    private String brokerUrl;

    public ConnectionChecker(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        checkDatabaseConnection();
        checkMqttConnection();
        System.out.println("✅ SYSTEM READY: Database and Broker connected successfully.");
    }

    private void checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                System.out.println("✅ DATABASE: Connected to PostgreSQL.");
            }
        } catch (Exception e) {
            System.err.println("❌ DATABASE ERROR: Could not connect to PostgreSQL.");
            System.err.println("Reason: " + e.getMessage());
            System.exit(1); // Exit program
        }
    }

    private void checkMqttConnection() {
        try {
            MqttClient testClient = new MqttClient(brokerUrl, "StartupChecker");
            MqttConnectOptions options = new MqttConnectOptions();
            options.setConnectionTimeout(5);

            testClient.connect(options);
            if (testClient.isConnected()) {
                System.out.println("✅ BROKER: Connected to MQTT Broker at " + brokerUrl);
                testClient.disconnect();
                testClient.close();
            }
        } catch (Exception e) {
            System.err.println("❌ MQTT ERROR: Could not connect to Broker at " + brokerUrl);
            System.err.println("Reason: " + e.getMessage());
            System.exit(1); // Exit program
        }
    }
}
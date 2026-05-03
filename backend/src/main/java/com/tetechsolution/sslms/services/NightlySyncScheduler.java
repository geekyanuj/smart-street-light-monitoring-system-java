package com.tetechsolution.sslms.services;

import com.tetechsolution.sslms.models.Device;
import com.tetechsolution.sslms.repositories.DeviceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NightlySyncScheduler {

    private final MqttService mqttService;
    private final DeviceRepository deviceRepository;

    public NightlySyncScheduler(MqttService mqttService, DeviceRepository deviceRepository) {
        this.mqttService = mqttService;
        this.deviceRepository = deviceRepository;
    }

    // Cron setup: Runs at 8:00 PM, 12:00 AM, and 4:00 AM daily
    // Format: "0 0 20,0,4 * * *"
    @Scheduled(cron = "${sslms.sync.schedule:0 0 20,0,4 * * *}")
    public void scheduleNightlyFetch() {
        List<Device> devices = deviceRepository.findAll();
        System.out.println("🌙 Starting scheduled nightly fetch for " + devices.size() + " devices...");

        for (Device device : devices) {
            mqttService.triggerManualSync(device.getDeviceId());
        }
    }
}
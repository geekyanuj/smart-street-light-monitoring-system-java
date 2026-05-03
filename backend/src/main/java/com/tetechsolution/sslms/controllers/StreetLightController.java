package com.tetechsolution.sslms.controllers;


import com.tetechsolution.sslms.models.Device;
import com.tetechsolution.sslms.models.Telemetry;
import com.tetechsolution.sslms.repositories.DeviceRepository;
import com.tetechsolution.sslms.repositories.TelemetryRepository;
import com.tetechsolution.sslms.services.MqttService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/streetlights")
public class StreetLightController {

    private final MqttService mqttService;
    private final DeviceRepository deviceRepository;
    private final TelemetryRepository telemetryRepository;

    public StreetLightController(MqttService mqttService, DeviceRepository deviceRepository, TelemetryRepository telemetryRepository) {
        this.mqttService = mqttService;
        this.deviceRepository = deviceRepository;
        this.telemetryRepository = telemetryRepository;
    }

    // 1. API to Control Relay (ON/OFF)
    @PostMapping("/{deviceId}/control")
    public ResponseEntity<String> controlRelay(@PathVariable String deviceId, @RequestParam String command) {
        mqttService.sendRelayCommand(deviceId, command.toUpperCase());
        return ResponseEntity.ok("Command " + command + " sent to " + deviceId);
    }

    // 2. API to Fetch Latest Data for a Device
    @GetMapping("/{deviceId}/latest")
    public ResponseEntity<Telemetry> getLatestData(@PathVariable String deviceId) {
        return telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. API to Fetch All Devices (For Dashboard Map/List)
    @GetMapping("/all")
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }
}

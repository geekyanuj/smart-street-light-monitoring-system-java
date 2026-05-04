package com.tetechsolution.sslms.controllers;

import com.tetechsolution.sslms.models.Device;
import com.tetechsolution.sslms.models.Telemetry;
import com.tetechsolution.sslms.repositories.DeviceRepository;
import com.tetechsolution.sslms.repositories.TelemetryRepository;
import com.tetechsolution.sslms.services.MqttService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/sslms/devices")
public class StreetLightController {

    private final MqttService mqttService;
    private final DeviceRepository deviceRepository;
    private final TelemetryRepository telemetryRepository;
    private final com.tetechsolution.sslms.services.DeviceService deviceService;
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(StreetLightController.class);

    public StreetLightController(MqttService mqttService, 
                               DeviceRepository deviceRepository, 
                               TelemetryRepository telemetryRepository,
                               com.tetechsolution.sslms.services.DeviceService deviceService) {
        this.mqttService = mqttService;
        this.deviceRepository = deviceRepository;
        this.telemetryRepository = telemetryRepository;
        this.deviceService = deviceService;
    }

    // --- CRUD Operations ---

    @PostMapping
    public Device create(@RequestBody Device device) {
        return deviceService.save(device);
    }

    @GetMapping
    public List<Device> getAll() {
        return deviceService.getAll();
    }

    @GetMapping("/{id}")
    public Device getById(@PathVariable String id) {
        return deviceService.getById(id);
    }

    @PatchMapping("/{id}")
    public Device updateDevicePartially(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {
        return deviceService.partialUpdate(id, updates);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        deviceService.delete(id);
    }

    // --- Street Light Operations ---

    @PostMapping("/{deviceId}/control")
    public ResponseEntity<String> controlRelay(@PathVariable String deviceId, @RequestParam String command, jakarta.servlet.http.HttpServletRequest request) {
        logger.info("Control Request for: {} | Header: {}", deviceId, request.getHeader("Authorization"));
        mqttService.sendRelayCommand(deviceId, command.toUpperCase());
        return ResponseEntity.ok("Command " + command + " sent to " + deviceId);
    }

    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcastRelay(@RequestParam String command) {
        logger.info("Broadcast Request: {}", command);
        mqttService.broadcastCommand(command.toUpperCase());
        return ResponseEntity.ok("Broadcast " + command + " sent to all nodes");
    }

    @GetMapping("/{deviceId}/latest")
    public ResponseEntity<Telemetry> getLatestData(@PathVariable String deviceId) {
        return telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    @PostMapping("/{deviceId}/syncnow")
    public CompletableFuture<ResponseEntity<Object>> syncNow(@PathVariable String deviceId, jakarta.servlet.http.HttpServletRequest request) {
        logger.info("SyncNow Request for: {} | Header: {}", deviceId, request.getHeader("Authorization"));
        return mqttService.triggerManualSync(deviceId)
                .orTimeout(10, TimeUnit.SECONDS)
                .thenApply(latestTelemetry -> {
                    return deviceRepository.findById(deviceId).map(device -> {
                        Map<String, Object> response = new HashMap<>();
                        response.put("deviceInfo", device);
                        response.put("latestTelemetry", latestTelemetry);
                        response.put("source", "HARDWARE_REALTIME");
                        return ResponseEntity.ok((Object) response);
                    }).orElse(ResponseEntity.notFound().build());
                })
                .exceptionally(ex -> {
                    Device device = deviceRepository.findById(deviceId).orElse(null);
                    Telemetry lastKnown = telemetryRepository.findTopByDeviceIdOrderByTimestampDesc(deviceId).orElse(null);

                    Map<String, Object> response = new HashMap<>();
                    response.put("deviceInfo", device);
                    response.put("latestTelemetry", lastKnown);
                    response.put("source", "DATABASE_FALLBACK");
                    response.put("error", "Hardware timeout: " + ex.getMessage());

                    return ResponseEntity.ok(response);
                });
    }

    @GetMapping("/{deviceId}/history")
    public List<Telemetry> getHistory(@PathVariable String deviceId) {
        return telemetryRepository.findAllByDeviceIdOrderByTimestampDesc(deviceId);
    }

    @GetMapping("/telemetry/log")
    public List<Telemetry> getGlobalLog() {
        return telemetryRepository.findTop50ByOrderByTimestampDesc();
    }
}
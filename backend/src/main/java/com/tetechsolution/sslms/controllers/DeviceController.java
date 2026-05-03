package com.tetechsolution.sslms.controllers;

import com.tetechsolution.sslms.models.Device;
import com.tetechsolution.sslms.services.DeviceService;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private final DeviceService service;

    public DeviceController(DeviceService service) {
        this.service = service;
    }

    @PostMapping
    public Device create(@RequestBody Device device) {
        return service.save(device);
    }

    @GetMapping
    public List<Device> getAll() {
        return service.getAll();
    }

    @PatchMapping("/{id}")
    public Device updateDevicePartially(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {
        return service.partialUpdate(id, updates);
    }

    @GetMapping("/{id}")
    public Device getById(@PathVariable String id) {
        return service.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

}

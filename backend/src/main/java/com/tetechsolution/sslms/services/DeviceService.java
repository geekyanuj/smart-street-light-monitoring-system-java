package com.tetechsolution.sslms.services;

import com.tetechsolution.sslms.models.Device;
import com.tetechsolution.sslms.repositories.DeviceRepository;
import org.springframework.stereotype.Service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DeviceService {

    private final DeviceRepository repository;

    public DeviceService(DeviceRepository repository) {
        this.repository = repository;
    }

    public Device save(Device device) {
        if (repository.existsById(device.getDeviceId())) {
            throw new RuntimeException("Device ID '" + device.getDeviceId() + "' is already registered in the system.");
        }
        return repository.save(device);
    }

    public Device partialUpdate(String id, Map<String, Object> updates) {

        Device device = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        // Only allow these fields to be updated
        Set<String> allowedFields = Set.of("feederId", "landmark", "area", "wardNo", "latitude", "longitude", "status", "baselineWatt", "lowerOffset", "upperOffset");

        updates.forEach((key, value) -> {

            if (!allowedFields.contains(key)) {
                return; // Skip fields that are not allowed or not in the model
            }

            try {
                Field field = Device.class.getDeclaredField(key);
                field.setAccessible(true);

                if (value == null) {
                    field.set(device, null);
                } else if (field.getType() == Double.class && value instanceof Number) {
                    field.set(device, ((Number) value).doubleValue());
                } else if (field.getType() == Integer.class && value instanceof Number) {
                    field.set(device, ((Number) value).intValue());
                } else if (field.getType().isAssignableFrom(value.getClass())) {
                    field.set(device, value);
                }

            } catch (NoSuchFieldException | IllegalAccessException e) {
                // Skip if error
            }
        });

        return repository.save(device);
    }

    public List<Device> getAll() {
        return repository.findAll();
    }

    public Device getById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
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
        Set<String> allowedFields = Set.of("feederId", "landmark", "area", "wardNo", "baselineWatt", "status");

        updates.forEach((key, value) -> {

            if (!allowedFields.contains(key)) {
                throw new RuntimeException("Field '" + key + "' is not allowed to update");
            }

            try {
                Field field = Device.class.getDeclaredField(key);
                field.setAccessible(true);

                // Optional: type check before setting
                if (value != null && !field.getType().isAssignableFrom(value.getClass())) {
                    throw new RuntimeException("Invalid type for field '" + key + "'");
                }

                field.set(device, value);

            } catch (NoSuchFieldException | IllegalAccessException e) {
                throw new RuntimeException("Error updating field '" + key + "'", e);
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
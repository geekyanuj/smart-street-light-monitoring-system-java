package com.tetechsolution.sslms.services;

import com.tetechsolution.sslms.models.Device;
import com.tetechsolution.sslms.repositories.DeviceRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DeviceService {

    private final DeviceRepository repository;

    public DeviceService(DeviceRepository repository) {
        this.repository = repository;
    }

    public Device save(Device device) {
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
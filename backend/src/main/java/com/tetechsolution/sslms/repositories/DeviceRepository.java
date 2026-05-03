package com.tetechsolution.sslms.repositories;

import com.tetechsolution.sslms.models.Device;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface DeviceRepository extends JpaRepository<Device, String> {
    @Modifying
    @Transactional
    @Query("UPDATE Device d SET d.status = :status WHERE d.deviceId = :id")
    void updateStatus(String id, String status);
}
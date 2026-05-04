package com.tetechsolution.sslms.repositories;

import com.tetechsolution.sslms.models.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    Optional<Telemetry> findTopByDeviceIdOrderByTimestampDesc(String deviceId);
    List<Telemetry> findAllByDeviceIdOrderByTimestampDesc(String deviceId);
    List<Telemetry> findTop50ByOrderByTimestampDesc();
}
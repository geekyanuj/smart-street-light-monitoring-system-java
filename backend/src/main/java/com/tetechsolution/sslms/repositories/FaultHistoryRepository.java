package com.tetechsolution.sslms.repositories;

import com.tetechsolution.sslms.models.FaultHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FaultHistoryRepository extends JpaRepository<FaultHistory, Long> {

    /**
     * Retrieves all past faults for a specific device.
     * Useful for maintenance reports and calculating bulb life.
     */
    List<FaultHistory> findByDeviceIdOrderByTimestampDesc(String deviceId);

    /**
     * Counts active/recent faults to show on the global admin dashboard.
     */
    long countByResolvedFalse();
}
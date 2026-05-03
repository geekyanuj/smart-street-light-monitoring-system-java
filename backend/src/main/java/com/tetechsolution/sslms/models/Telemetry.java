package com.tetechsolution.sslms.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "telemetry")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Telemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment for Postgres
    private Long id;

    private String deviceId; // Changed from id to deviceId to match repo query
    private Double voltage;  // Changed to Double for calculations
    private Double current;
    private Double power;

    @Column(insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private java.time.LocalDateTime timestamp; // Use actual timestamp, not Integer

    public Telemetry(String deviceId, Double voltage, Double current, Double power) {
        this.deviceId = deviceId;
        this.voltage = voltage;
        this.current = current;
        this.power = power;
    }
}


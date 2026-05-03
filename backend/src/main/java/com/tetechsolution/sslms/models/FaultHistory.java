package com.tetechsolution.sslms.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fault_history")
@Data
@NoArgsConstructor // Required by JPA
public class FaultHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId;
    private String description;
    private Double currentAtFault;
    private Boolean resolved = false;

    private LocalDateTime timestamp = LocalDateTime.now();

    // Custom Constructor for Fault Detection Logic
    public FaultHistory(String deviceId, String description, Double currentAtFault) {
        this.deviceId = deviceId;
        this.description = description;
        this.currentAtFault = currentAtFault;
        this.resolved = false; // Default for new faults
        this.timestamp = LocalDateTime.now();
    }
}


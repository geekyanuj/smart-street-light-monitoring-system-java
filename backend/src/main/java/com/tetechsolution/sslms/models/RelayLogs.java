package com.tetechsolution.sslms.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "relay_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelayLogs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String deviceId; // Use deviceId to be consistent
    private String command;
    private String triggeredBy; // Usually "SYSTEM" or "ADMIN"
    private java.time.LocalDateTime timestamp = java.time.LocalDateTime.now();
}


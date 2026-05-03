package com.tetechsolution.sslms.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "devices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Device {

    @Id
    private String deviceId;

    private String feederId;
    private String landmark;
    private String area;
    private Integer wardNo;
    private Double baselineWatt;
    private String status;
}

package com.aractakip.dorse;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "dorseler")
@Getter
@NoArgsConstructor
public class Dorse {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String plaka;

    private Boolean aktif;
}

package com.aractakip.arac;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "araclar")
@Getter
@Setter
@NoArgsConstructor
public class Arac {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String plaka;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tur_id", nullable = false)
    private AracTuru tur;

    private Boolean aktif;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

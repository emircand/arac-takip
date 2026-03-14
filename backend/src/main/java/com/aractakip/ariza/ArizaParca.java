package com.aractakip.ariza;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ariza_parcalar")
@Getter
@Setter
@NoArgsConstructor
public class ArizaParca {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ariza_id", nullable = false)
    private Ariza ariza;

    @Column(name = "parca_adi", nullable = false, length = 200)
    private String parcaAdi;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal miktar = BigDecimal.ONE;

    @Column(nullable = false, length = 20)
    private String birim = "ADET";

    @Column(nullable = false)
    private boolean kullanildi = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stok_id")
    private com.aractakip.stok.StokKalem stokKalem;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

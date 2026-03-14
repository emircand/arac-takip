package com.aractakip.stok;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stok_kalemleri")
@Getter
@Setter
@NoArgsConstructor
public class StokKalem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "stok_adi", nullable = false, length = 200)
    private String stokAdi;

    @Column(length = 50, unique = true)
    private String kodu;

    @Column(nullable = false, length = 20)
    private String birim = "ADET";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal devir = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal giris = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cikis = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public BigDecimal getBakiye() {
        return devir.add(giris).subtract(cikis);
    }
}

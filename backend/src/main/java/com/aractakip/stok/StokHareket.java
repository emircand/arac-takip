package com.aractakip.stok;

import com.aractakip.ariza.Ariza;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stok_hareketler")
@Getter
@Setter
@NoArgsConstructor
public class StokHareket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "stok_id", nullable = false)
    private StokKalem stokKalem;

    @Column(nullable = false, length = 10)
    private String tip; // "giris" | "cikis"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal miktar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ariza_id")
    private Ariza ariza;

    @Column(columnDefinition = "text")
    private String aciklama;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

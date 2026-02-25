package com.aractakip.yakit;

import com.aractakip.arac.Arac;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "yakitlar")
@Getter
@Setter
@NoArgsConstructor
public class Yakit {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arac_id", nullable = false)
    private Arac arac;

    @Column(nullable = false)
    private LocalDateTime tarih;

    @Column(name = "miktar_lt", nullable = false, precision = 8, scale = 2)
    private BigDecimal miktarLt;

    @Column(precision = 10, scale = 2)
    private BigDecimal tutar;

    @Column(length = 200)
    private String istasyon;

    @Column(name = "istasyon_ili", length = 100)
    private String istasyonIli;

    @Column(name = "utts_no", length = 50)
    private String uttsNo;

    @Column(nullable = false)
    private boolean anomali = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

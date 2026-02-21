package com.aractakip.sefer;

import com.aractakip.cekici.Cekici;
import com.aractakip.dorse.Dorse;
import com.aractakip.sofor.Sofor;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "seferler")
@Getter
@NoArgsConstructor
public class Sefer {

    @Id
    private UUID id;

    @Column(name = "girdi_yapan")
    private UUID girdiYapan;

    private LocalDate tarih;

    private String bolge;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cekici_id")
    private Cekici cekici;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dorse_id")
    private Dorse dorse;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sofor_id")
    private Sofor sofor;

    @Column(name = "cikis_saati")
    private LocalTime cikisSaati;

    @Column(name = "donus_saati")
    private LocalTime donusSaati;

    // generated column — read-only
    @Column(insertable = false, updatable = false)
    private Integer km;

    @Column(precision = 10, scale = 3)
    private BigDecimal tonaj;

    @Column(name = "cikis_km")
    private Integer cikisKm;

    @Column(name = "donus_km")
    private Integer donusKm;

    @Column(name = "sfr_srs")
    private Integer sfrSrs;

    private Integer sfr;

    @Column(precision = 8, scale = 2)
    private BigDecimal yakit;

    private String notlar;
}

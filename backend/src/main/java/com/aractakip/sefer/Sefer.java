package com.aractakip.sefer;

import com.aractakip.arac.Arac;
import com.aractakip.sofor.Sofor;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "seferler")
@Getter
@Setter
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
    private Arac cekici;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "dorse_id")
    private Arac dorse;

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

    private Integer tonaj;

    @Column(name = "cikis_km")
    private Integer cikisKm;

    @Column(name = "donus_km")
    private Integer donusKm;

    @Column(name = "sfr_srs")
    private Integer sfrSrs;

    private Integer sfr;

    @Column(precision = 8, scale = 2)
    private BigDecimal yakit;

    @Column(name = "alinan_yakit", precision = 10, scale = 2)
    private BigDecimal alinanYakit;

    private String notlar;

    @Column(name = "km_uyari", nullable = false)
    private Boolean kmUyari = false;

    @Column(name = "km_uyari_aciklama")
    private String kmUyariAciklama;
}

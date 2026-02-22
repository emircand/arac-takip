package com.aractakip.arac;

import com.aractakip.firma.Firma;
import com.aractakip.lokasyon.Sube;
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

    // ── Envanter alanları ─────────────────────────────────────────────────────

    @Column(length = 50)
    private String marka;

    @Column(name = "model_yili")
    private Integer modelYili;

    @Column(length = 100)
    private String cinsi;

    @Column(length = 30)
    private String renk;

    @Column(name = "motor_gucu")
    private Integer motorGucu;

    @Column(name = "silindir_hacmi")
    private Integer silindirHacmi;

    @Column(name = "sase_no", length = 50)
    private String saseNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "firma_id")
    private Firma firma;

    @Column(name = "bos_agirlik")
    private Integer bosAgirlik;

    @Column(name = "lastik_tipi", length = 50)
    private String lastikTipi;

    @Column(name = "arvento_no")
    private Integer arventoNo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sube_id")
    private Sube sube;

    @Column(name = "onceki_plaka", length = 20)
    private String oncekiPlaka;

    @Column(length = 20, nullable = false)
    private String durumu = "aktif";

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

package com.aractakip.ariza;

import com.aractakip.arac.Arac;
import com.aractakip.sofor.Sofor;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "arizalar")
@Getter
@Setter
@NoArgsConstructor
public class Ariza {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "arac_id", nullable = false)
    private Arac arac;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sofor_id")
    private Sofor sofor;

    @Column(nullable = false, length = 200)
    private String baslik;

    @Column(columnDefinition = "text")
    private String aciklama;

    @Column(nullable = false, length = 20)
    private String durum = "acik";

    @Column(nullable = false)
    private boolean calisalamaz = false;

    @Column(name = "bildirim_zamani")
    private Instant bildirimZamani;

    @Column(name = "islem_yapan", length = 100)
    private String islemYapan;

    @Column(name = "tamamlanma_notu", length = 100)
    private String tamamlannaNotu;

    @Column(name = "tamamlandi_at")
    private Instant tamamlandiAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

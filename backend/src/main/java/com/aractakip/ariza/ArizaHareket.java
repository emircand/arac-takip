package com.aractakip.ariza;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ariza_hareketler")
@Getter
@Setter
@NoArgsConstructor
public class ArizaHareket {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ariza_id", nullable = false)
    private Ariza ariza;

    @Column(name = "eski_durum", length = 20)
    private String eskiDurum;

    @Column(name = "yeni_durum", nullable = false, length = 20)
    private String yeniDurum;

    @Column(columnDefinition = "text")
    private String aciklama;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}

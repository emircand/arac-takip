package com.aractakip.sofor;

import com.aractakip.lokasyon.Sube;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "soforler")
@Getter
@Setter
@NoArgsConstructor
public class Sofor {

    @Id
    private UUID id;

    @Column(name = "ad_soyad", nullable = false)
    private String adSoyad;

    private String telefon;

    private Boolean aktif;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sube_id")
    private Sube sube;
}

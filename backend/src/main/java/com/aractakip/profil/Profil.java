package com.aractakip.profil;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "profiller")
@Getter
@NoArgsConstructor
public class Profil {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "sifre_hash", nullable = false)
    private String sifreHash;

    @Column(name = "ad_soyad", nullable = false)
    private String adSoyad;

    @Column(nullable = false)
    private String rol;

    private Boolean aktif;
}

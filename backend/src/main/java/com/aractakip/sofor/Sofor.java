package com.aractakip.sofor;

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
}

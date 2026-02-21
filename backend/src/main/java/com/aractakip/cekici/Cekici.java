package com.aractakip.cekici;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "cekiciler")
@Getter
@NoArgsConstructor
public class Cekici {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String plaka;

    @Column(name = "arac_tipi")
    private String aracTipi;

    private Boolean aktif;
}

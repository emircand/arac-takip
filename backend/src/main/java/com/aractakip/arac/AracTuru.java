package com.aractakip.arac;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "arac_turleri")
@Getter
@Setter
@NoArgsConstructor
public class AracTuru {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String ad;

    private Boolean motorlu;

    @Column(name = "muayene_zorunlu")
    private Boolean muayeneZorunlu;

    @Column(name = "sigorta_zorunlu")
    private Boolean sigortaZorunlu;

    @Column(name = "gps_destekli")
    private Boolean gpsDestekli;

    @Column(name = "sefere_katilabilir")
    private Boolean sefereKatilabilir;

    @Column(name = "dorse_alabilir")
    private Boolean dorseAlabilir;
}

package com.aractakip.lokasyon;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "subeler")
@Getter
@Setter
@NoArgsConstructor
public class Sube {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String ad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "bolge_id")
    private Bolge bolge;

    private Boolean aktif;
}

package com.aractakip.lokasyon;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bolgeler")
@Getter
@Setter
@NoArgsConstructor
public class Bolge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String ad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "depo_id", nullable = false)
    private Depo depo;

    private Boolean aktif;
}

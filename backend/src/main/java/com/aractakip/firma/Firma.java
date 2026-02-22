package com.aractakip.firma;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "firmalar")
@Getter
@Setter
@NoArgsConstructor
public class Firma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String ad;

    private Boolean aktif;
}

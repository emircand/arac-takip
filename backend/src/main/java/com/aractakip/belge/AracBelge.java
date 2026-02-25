package com.aractakip.belge;

import com.aractakip.arac.Arac;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Entity
@Table(name = "arac_belgeler")
@Getter
@Setter
@NoArgsConstructor
public class AracBelge {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "arac_id", nullable = false)
    private Arac arac;

    @Column(name = "belge_turu", nullable = false)
    private String belgeTuru;

    @Column(name = "bitis_tarihi", nullable = false)
    private LocalDate bitisTarihi;

    @Column(name = "cihaz_no", length = 50)
    private String cihazNo;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Transient
    public long getKalanGun() {
        return ChronoUnit.DAYS.between(LocalDate.now(), bitisTarihi);
    }

    @Transient
    public BelgeDurum getDurum() {
        return BelgeDurum.of(getKalanGun());
    }
}

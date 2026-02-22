package com.aractakip.arac;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AracRepository extends JpaRepository<Arac, UUID> {

    List<Arac> findAllByOrderByPlakaAsc();

    List<Arac> findByAktifOrderByPlakaAsc(Boolean aktif);

    List<Arac> findByTur_AdOrderByPlakaAsc(String turAd);

    List<Arac> findByTur_AdAndAktifOrderByPlakaAsc(String turAd, Boolean aktif);

    List<Arac> findByTur_SefereKatilabilirTrueAndAktifTrueOrderByPlakaAsc();
}

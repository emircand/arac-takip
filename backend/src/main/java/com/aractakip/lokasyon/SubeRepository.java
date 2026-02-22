package com.aractakip.lokasyon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubeRepository extends JpaRepository<Sube, Integer> {
    List<Sube> findByAktifTrueOrderByAdAsc();
    List<Sube> findByBolge_IdAndAktifTrueOrderByAdAsc(Integer bolgeId);
}

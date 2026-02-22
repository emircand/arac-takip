package com.aractakip.lokasyon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BolgeRepository extends JpaRepository<Bolge, Integer> {
    List<Bolge> findByAktifTrueOrderByAdAsc();
    List<Bolge> findByDepo_IdAndAktifTrueOrderByAdAsc(Integer depoId);
}

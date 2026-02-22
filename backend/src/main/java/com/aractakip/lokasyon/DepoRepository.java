package com.aractakip.lokasyon;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepoRepository extends JpaRepository<Depo, Integer> {
    List<Depo> findByAktifTrueOrderByAdAsc();
}

package com.aractakip.firma;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FirmaRepository extends JpaRepository<Firma, Integer> {
    List<Firma> findByAktifTrueOrderByAdAsc();
}

package com.aractakip.cekici;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CekiciRepository extends JpaRepository<Cekici, UUID> {

    List<Cekici> findByAktifOrderByPlakaAsc(Boolean aktif);

    List<Cekici> findAllByOrderByPlakaAsc();
}

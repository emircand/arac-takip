package com.aractakip.dorse;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DorseRepository extends JpaRepository<Dorse, UUID> {

    List<Dorse> findByAktifOrderByPlakaAsc(Boolean aktif);

    List<Dorse> findAllByOrderByPlakaAsc();
}

package com.aractakip.sofor;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SoforRepository extends JpaRepository<Sofor, UUID> {

    List<Sofor> findByAktifOrderByAdSoyadAsc(Boolean aktif);

    List<Sofor> findAllByOrderByAdSoyadAsc();
}

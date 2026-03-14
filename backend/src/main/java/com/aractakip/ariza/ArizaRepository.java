package com.aractakip.ariza;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArizaRepository extends JpaRepository<Ariza, UUID> {

    List<Ariza> findByAracIdOrderByCreatedAtDesc(UUID aracId);

    List<Ariza> findAllByOrderByCreatedAtDesc();

    List<Ariza> findByDurumOrderByCreatedAtDesc(String durum);

    long countByDurum(String durum);
}

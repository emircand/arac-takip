package com.aractakip.ariza;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArizaHareketRepository extends JpaRepository<ArizaHareket, UUID> {

    List<ArizaHareket> findByArizaIdOrderByCreatedAtAsc(UUID arizaId);
}

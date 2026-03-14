package com.aractakip.ariza;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ArizaParcaRepository extends JpaRepository<ArizaParca, UUID> {

    List<ArizaParca> findByArizaIdOrderByCreatedAtAsc(UUID arizaId);
}

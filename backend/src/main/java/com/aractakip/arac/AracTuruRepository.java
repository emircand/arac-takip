package com.aractakip.arac;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AracTuruRepository extends JpaRepository<AracTuru, UUID> {

    List<AracTuru> findAllByOrderByAdAsc();
}

package com.aractakip.stok;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StokHareketRepository extends JpaRepository<StokHareket, UUID> {

    List<StokHareket> findByStokKalemIdOrderByCreatedAtDesc(UUID stokId);
}

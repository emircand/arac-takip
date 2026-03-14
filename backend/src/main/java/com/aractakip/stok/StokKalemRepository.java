package com.aractakip.stok;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StokKalemRepository extends JpaRepository<StokKalem, UUID> {

    List<StokKalem> findAllByOrderByStokAdiAsc();

    List<StokKalem> findByStokAdiContainingIgnoreCaseOrderByStokAdiAsc(String ara);
}

package com.aractakip.stok;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface StokKalemRepository extends JpaRepository<StokKalem, UUID> {

    List<StokKalem> findAllByOrderByStokAdiAsc();

    List<StokKalem> findByStokAdiContainingIgnoreCaseOrderByStokAdiAsc(String ara);

    @Query("SELECT k FROM StokKalem k WHERE (k.devir + k.giris - k.cikis) <= :esik ORDER BY (k.devir + k.giris - k.cikis) ASC")
    List<StokKalem> findKritik(@Param("esik") BigDecimal esik);
}

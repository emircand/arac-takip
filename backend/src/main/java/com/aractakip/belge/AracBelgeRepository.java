package com.aractakip.belge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AracBelgeRepository extends JpaRepository<AracBelge, UUID> {

    // Araç bazlı tüm belgeler (geçmiş)
    List<AracBelge> findByAracIdOrderByBitisTarihiDesc(UUID aracId);

    // Belge türü geçmişi
    List<AracBelge> findByAracIdAndBelgeTuruOrderByBitisTarihiDesc(UUID aracId, String belgeTuru);

    // Güncel belgeler — araç başına her belge türünün en son kaydı
    @Query(value = """
            SELECT DISTINCT ON (belge_turu) *
            FROM arac_belgeler
            WHERE arac_id = :aracId
            ORDER BY belge_turu, bitis_tarihi DESC
            """, nativeQuery = true)
    List<AracBelge> findGuncelByAracId(@Param("aracId") UUID aracId);

    // Tüm araçların güncel belgeleri (uyarı listesi + dashboard sayımı için)
    @Query(value = """
            SELECT DISTINCT ON (arac_id, belge_turu) *
            FROM arac_belgeler
            ORDER BY arac_id, belge_turu, bitis_tarihi DESC
            """, nativeQuery = true)
    List<AracBelge> findTumGuncel();
}

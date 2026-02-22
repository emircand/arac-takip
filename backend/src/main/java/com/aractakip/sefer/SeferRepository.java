package com.aractakip.sefer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SeferRepository extends JpaRepository<Sefer, UUID>, JpaSpecificationExecutor<Sefer> {

    // Dashboard — özet (tarih aralığı)
    @Query(value = """
            SELECT COUNT(*) AS trip_count,
                   COALESCE(SUM(tonaj), 0) AS total_tonaj,
                   COALESCE(SUM(km), 0)    AS total_km,
                   COALESCE(SUM(yakit), 0) AS total_yakit
            FROM seferler
            WHERE (:start IS NULL OR tarih >= CAST(:start AS date))
              AND (:end   IS NULL OR tarih <= CAST(:end AS date))
            """, nativeQuery = true)
    OzetProj getOzet(@Param("start") String start, @Param("end") String end);

    // Dashboard — bölge bazlı
    @Query(value = """
            SELECT bolge,
                   COUNT(*) AS trip_count,
                   COALESCE(SUM(tonaj), 0) AS total_tonaj,
                   COALESCE(SUM(km), 0)    AS total_km,
                   COALESCE(SUM(yakit), 0) AS total_yakit
            FROM seferler
            WHERE (:start IS NULL OR tarih >= CAST(:start AS date))
              AND (:end   IS NULL OR tarih <= CAST(:end AS date))
            GROUP BY bolge
            ORDER BY total_tonaj DESC
            """, nativeQuery = true)
    List<BolgeProj> aggregateByBolge(@Param("start") String start, @Param("end") String end);

    // Dashboard — çekici bazlı
    @Query(value = """
            SELECT c.plaka,
                   COUNT(*) AS trip_count,
                   COALESCE(SUM(s.tonaj), 0) AS total_tonaj,
                   COALESCE(SUM(s.km), 0)    AS total_km,
                   COALESCE(SUM(s.yakit), 0) AS total_yakit
            FROM seferler s
            JOIN araclar c ON s.cekici_id = c.id
            WHERE (:start IS NULL OR s.tarih >= CAST(:start AS date))
              AND (:end   IS NULL OR s.tarih <= CAST(:end AS date))
            GROUP BY c.plaka
            ORDER BY total_tonaj DESC
            """, nativeQuery = true)
    List<CekiciProj> aggregateByCekici(@Param("start") String start, @Param("end") String end);

    // Dashboard — şoför bazlı
    @Query(value = """
            SELECT sf.ad_soyad,
                   COUNT(*) AS trip_count,
                   COALESCE(SUM(s.tonaj), 0) AS total_tonaj,
                   COALESCE(SUM(s.km), 0)    AS total_km
            FROM seferler s
            JOIN soforler sf ON s.sofor_id = sf.id
            WHERE (:start IS NULL OR s.tarih >= CAST(:start AS date))
              AND (:end   IS NULL OR s.tarih <= CAST(:end AS date))
            GROUP BY sf.ad_soyad
            ORDER BY total_tonaj DESC
            """, nativeQuery = true)
    List<SoforProj> aggregateBySofor(@Param("start") String start, @Param("end") String end);

    // KM zincir kontrolü — aynı çekicinin son seferi
    @Query(value = "SELECT * FROM seferler WHERE cekici_id = :cekiciId ORDER BY tarih DESC, sfr_srs DESC NULLS LAST, created_at DESC LIMIT 1", nativeQuery = true)
    List<Sefer> findLastByCekiciId(@Param("cekiciId") UUID cekiciId);

    // Projection interfaces — native query result mapping
    interface OzetProj {
        Long getTripCount();
        Double getTotalTonaj();
        Long getTotalKm();
        Double getTotalYakit();
    }

    interface BolgeProj {
        String getBolge();
        Long getTripCount();
        Double getTotalTonaj();
        Long getTotalKm();
        Double getTotalYakit();
    }

    interface CekiciProj {
        String getPlaka();
        Long getTripCount();
        Double getTotalTonaj();
        Long getTotalKm();
        Double getTotalYakit();
    }

    interface SoforProj {
        String getAdSoyad();
        Long getTripCount();
        Double getTotalTonaj();
        Long getTotalKm();
    }
}

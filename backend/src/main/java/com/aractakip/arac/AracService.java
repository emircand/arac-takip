package com.aractakip.arac;

import com.aractakip.arac.dto.AracRequest;
import com.aractakip.common.AktifRequest;
import com.aractakip.firma.FirmaRepository;
import com.aractakip.lokasyon.SubeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AracService {

    private final AracRepository aracRepository;
    private final AracTuruRepository aracTuruRepository;
    private final SubeRepository subeRepository;
    private final FirmaRepository firmaRepository;

    public List<Arac> getAll(String tur, Boolean aktif) {
        if (tur != null && aktif != null) {
            return aracRepository.findByTur_AdAndAktifOrderByPlakaAsc(tur, aktif);
        }
        if (tur != null) {
            return aracRepository.findByTur_AdOrderByPlakaAsc(tur);
        }
        if (aktif != null) {
            return aracRepository.findByAktifOrderByPlakaAsc(aktif);
        }
        return aracRepository.findAllByOrderByPlakaAsc();
    }

    public List<Arac> getSefereKatilabilir() {
        return aracRepository.findByTur_SefereKatilabilirTrueAndAktifTrueOrderByPlakaAsc();
    }

    public Arac create(AracRequest req) {
        AracTuru tur = aracTuruRepository.findById(req.turId())
                .orElseThrow(() -> new NoSuchElementException("Araç türü bulunamadı."));
        String plaka = normalizeKod(req.plaka());
        validatePlaka(plaka);
        Arac arac = new Arac();
        arac.setId(UUID.randomUUID());
        arac.setPlaka(plaka);
        arac.setTur(tur);
        arac.setAktif(req.aktif() != null ? req.aktif() : true);
        applyEnvanter(arac, req);
        return aracRepository.save(arac);
    }

    public Arac update(UUID id, AracRequest req) {
        Arac arac = aracRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Araç bulunamadı."));
        String plaka = normalizeKod(req.plaka());
        validatePlaka(plaka);
        arac.setPlaka(plaka);
        if (req.turId() != null) {
            AracTuru tur = aracTuruRepository.findById(req.turId())
                    .orElseThrow(() -> new NoSuchElementException("Araç türü bulunamadı."));
            arac.setTur(tur);
        }
        if (req.aktif() != null) arac.setAktif(req.aktif());
        applyEnvanter(arac, req);
        return aracRepository.save(arac);
    }

    public Arac setAktif(UUID id, AktifRequest req) {
        Arac arac = aracRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Araç bulunamadı."));
        arac.setAktif(req.aktif());
        return aracRepository.save(arac);
    }

    public List<AracTuru> getAllTurler() {
        return aracTuruRepository.findAllByOrderByAdAsc();
    }

    private void applyEnvanter(Arac arac, AracRequest req) {
        arac.setMarka(trim(req.marka()));
        arac.setModelYili(req.modelYili());
        arac.setCinsi(trim(req.cinsi()));
        arac.setRenk(trim(req.renk()));
        arac.setMotorGucu(req.motorGucu());
        arac.setSilindirHacmi(req.silindirHacmi());
        arac.setSaseNo(normalizeKod(req.saseNo()));
        arac.setFirma(req.firmaId() != null ? firmaRepository.getReferenceById(req.firmaId()) : null);
        arac.setBosAgirlik(req.bosAgirlik());
        arac.setLastikTipi(trim(req.lastikTipi()));
        arac.setArventoNo(req.arventoNo());
        arac.setSube(req.subeId() != null ? subeRepository.getReferenceById(req.subeId()) : null);
        arac.setOncekiPlaka(normalizeKod(req.oncekiPlaka()));
        if (req.durumu() != null) arac.setDurumu(req.durumu());
    }

    /** Büyük harf + tüm boşlukları sil. null → null */
    private String normalizeKod(String s) {
        return s == null ? null : s.replaceAll("\\s+", "").toUpperCase(java.util.Locale.forLanguageTag("tr-TR"));
    }

    /** Sadece baş/son boşluk sil. null → null */
    private String trim(String s) {
        return s == null ? null : s.strip();
    }

    /**
     * Türk plaka formatı kontrolü (normalizasyon sonrası).
     * Geçerli: 2 rakam + 1-3 harf + 1-4 rakam  →  06ABC1234
     */
    private static final java.util.regex.Pattern PLAKA_PATTERN =
            java.util.regex.Pattern.compile("^\\d{2}[A-Z]{1,3}\\d{1,4}$");

    private void validatePlaka(String plaka) {
        if (plaka == null || plaka.isBlank()) {
            throw new IllegalArgumentException("Plaka boş olamaz.");
        }
        if (!PLAKA_PATTERN.matcher(plaka).matches()) {
            throw new IllegalArgumentException(
                    "Geçersiz plaka formatı: \"" + plaka + "\". Beklenen format: 06ABC1234");
        }
    }
}

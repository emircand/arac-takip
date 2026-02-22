package com.aractakip.arac;

import com.aractakip.arac.dto.AracRequest;
import com.aractakip.common.AktifRequest;
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
        Arac arac = new Arac();
        arac.setId(UUID.randomUUID());
        arac.setPlaka(req.plaka());
        arac.setTur(tur);
        arac.setAktif(req.aktif() != null ? req.aktif() : true);
        return aracRepository.save(arac);
    }

    public Arac update(UUID id, AracRequest req) {
        Arac arac = aracRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Araç bulunamadı."));
        arac.setPlaka(req.plaka());
        if (req.turId() != null) {
            AracTuru tur = aracTuruRepository.findById(req.turId())
                    .orElseThrow(() -> new NoSuchElementException("Araç türü bulunamadı."));
            arac.setTur(tur);
        }
        if (req.aktif() != null) arac.setAktif(req.aktif());
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
}

package com.aractakip.sofor;

import com.aractakip.common.AktifRequest;
import com.aractakip.sofor.dto.SoforRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SoforService {

    private final SoforRepository soforRepository;

    public List<Sofor> getAll(Boolean aktif) {
        if (aktif != null) {
            return soforRepository.findByAktifOrderByAdSoyadAsc(aktif);
        }
        return soforRepository.findAllByOrderByAdSoyadAsc();
    }

    public Sofor create(SoforRequest req) {
        Sofor sofor = new Sofor();
        sofor.setId(UUID.randomUUID());
        sofor.setAdSoyad(req.adSoyad());
        sofor.setTelefon(req.telefon());
        sofor.setAktif(req.aktif() != null ? req.aktif() : true);
        return soforRepository.save(sofor);
    }

    public Sofor update(UUID id, SoforRequest req) {
        Sofor sofor = soforRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Şoför bulunamadı."));
        sofor.setAdSoyad(req.adSoyad());
        sofor.setTelefon(req.telefon());
        if (req.aktif() != null) sofor.setAktif(req.aktif());
        return soforRepository.save(sofor);
    }

    public Sofor setAktif(UUID id, AktifRequest req) {
        Sofor sofor = soforRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Şoför bulunamadı."));
        sofor.setAktif(req.aktif());
        return soforRepository.save(sofor);
    }
}

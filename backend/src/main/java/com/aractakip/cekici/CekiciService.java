package com.aractakip.cekici;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CekiciService {

    private final CekiciRepository cekiciRepository;

    public List<Cekici> getAll(Boolean aktif) {
        if (aktif != null) {
            return cekiciRepository.findByAktifOrderByPlakaAsc(aktif);
        }
        return cekiciRepository.findAllByOrderByPlakaAsc();
    }
}

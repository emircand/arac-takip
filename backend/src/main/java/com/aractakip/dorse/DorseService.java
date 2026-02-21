package com.aractakip.dorse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DorseService {

    private final DorseRepository dorseRepository;

    public List<Dorse> getAll(Boolean aktif) {
        if (aktif != null) {
            return dorseRepository.findByAktifOrderByPlakaAsc(aktif);
        }
        return dorseRepository.findAllByOrderByPlakaAsc();
    }
}

package com.aractakip.sofor;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
}

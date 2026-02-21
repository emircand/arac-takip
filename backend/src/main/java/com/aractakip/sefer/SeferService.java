package com.aractakip.sefer;

import com.aractakip.sefer.dto.SeferDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeferService {

    private final SeferRepository seferRepository;

    public List<SeferDto> getAll(LocalDate start, LocalDate end, String bolge,
                                 UUID cekiciId, UUID soforId) {
        return seferRepository
                .findWithFilters(start, end, bolge, cekiciId, soforId)
                .stream()
                .map(SeferDto::from)
                .toList();
    }
}

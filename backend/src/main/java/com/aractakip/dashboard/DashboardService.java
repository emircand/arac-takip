package com.aractakip.dashboard;

import com.aractakip.dashboard.dto.OzetDto;
import com.aractakip.sefer.SeferRepository;
import com.aractakip.sefer.SeferRepository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SeferRepository seferRepository;

    public OzetDto getOzet(LocalDate start, LocalDate end) {
        String s = start != null ? start.toString() : null;
        String e = end != null ? end.toString() : null;
        return OzetDto.from(seferRepository.getOzet(s, e));
    }

    public List<BolgeProj> getByBolge(LocalDate start, LocalDate end) {
        return seferRepository.aggregateByBolge(toStr(start), toStr(end));
    }

    public List<CekiciProj> getByCekici(LocalDate start, LocalDate end) {
        return seferRepository.aggregateByCekici(toStr(start), toStr(end));
    }

    public List<SoforProj> getBySofor(LocalDate start, LocalDate end) {
        return seferRepository.aggregateBySofor(toStr(start), toStr(end));
    }

    private String toStr(LocalDate d) {
        return d != null ? d.toString() : null;
    }
}

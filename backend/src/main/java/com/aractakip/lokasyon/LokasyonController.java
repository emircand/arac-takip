package com.aractakip.lokasyon;

import com.aractakip.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class LokasyonController {

    private final DepoRepository depoRepository;
    private final BolgeRepository bolgeRepository;
    private final SubeRepository subeRepository;

    @GetMapping("/api/depolar")
    public ApiResponse<List<Depo>> getDepolar() {
        return ApiResponse.ok(depoRepository.findByAktifTrueOrderByAdAsc());
    }

    @GetMapping("/api/bolgeler")
    public ApiResponse<List<Bolge>> getBolgeler(
            @RequestParam(name = "depo_id", required = false) Integer depoId
    ) {
        if (depoId != null) {
            return ApiResponse.ok(bolgeRepository.findByDepo_IdAndAktifTrueOrderByAdAsc(depoId));
        }
        return ApiResponse.ok(bolgeRepository.findByAktifTrueOrderByAdAsc());
    }

    @GetMapping("/api/subeler")
    public ApiResponse<List<Sube>> getSubeler(
            @RequestParam(name = "bolge_id", required = false) Integer bolgeId
    ) {
        if (bolgeId != null) {
            return ApiResponse.ok(subeRepository.findByBolge_IdAndAktifTrueOrderByAdAsc(bolgeId));
        }
        return ApiResponse.ok(subeRepository.findByAktifTrueOrderByAdAsc());
    }

    @GetMapping("/api/lokasyonlar/agac")
    public ApiResponse<List<DepoAgacDto>> getAgac() {
        List<Depo> depolar = depoRepository.findByAktifTrueOrderByAdAsc();
        List<Bolge> bolgeler = bolgeRepository.findByAktifTrueOrderByAdAsc();
        List<Sube> subeler = subeRepository.findByAktifTrueOrderByAdAsc();

        List<DepoAgacDto> result = depolar.stream().map(depo -> {
            List<BolgeAgacDto> bolgeList = bolgeler.stream()
                    .filter(b -> b.getDepo().getId().equals(depo.getId()))
                    .map(bolge -> {
                        List<SubeDto> subeList = subeler.stream()
                                .filter(s -> s.getBolge() != null && s.getBolge().getId().equals(bolge.getId()))
                                .map(s -> new SubeDto(s.getId(), s.getAd()))
                                .toList();
                        return new BolgeAgacDto(bolge.getId(), bolge.getAd(), subeList);
                    }).toList();
            return new DepoAgacDto(depo.getId(), depo.getAd(), bolgeList);
        }).toList();

        return ApiResponse.ok(result);
    }

    record SubeDto(Integer id, String ad) {}
    record BolgeAgacDto(Integer id, String ad, List<SubeDto> subeler) {}
    record DepoAgacDto(Integer id, String ad, List<BolgeAgacDto> bolgeler) {}
}

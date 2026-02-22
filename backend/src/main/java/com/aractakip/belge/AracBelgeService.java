package com.aractakip.belge;

import com.aractakip.arac.AracRepository;
import com.aractakip.belge.dto.AracBelgeDto;
import com.aractakip.belge.dto.AracBelgeRequest;
import com.aractakip.belge.dto.YaklasanBelgeDto;
import com.aractakip.lokasyon.Sube;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AracBelgeService {

    private final AracBelgeRepository belgeRepository;
    private final AracRepository aracRepository;

    public List<AracBelgeDto.Response> getByArac(UUID aracId) {
        return belgeRepository.findByAracIdOrderByBitisTarihiDesc(aracId)
                .stream().map(AracBelgeDto.Response::from).toList();
    }

    public List<AracBelgeDto.Response> getGecmis(UUID aracId, String belgeTuru) {
        return belgeRepository.findByAracIdAndBelgeTuruOrderByBitisTarihiDesc(aracId, belgeTuru)
                .stream().map(AracBelgeDto.Response::from).toList();
    }

    public AracBelgeDto.Response getById(UUID id) {
        return AracBelgeDto.Response.from(
                belgeRepository.findById(id)
                        .orElseThrow(() -> new NoSuchElementException("Belge bulunamadı."))
        );
    }

    public AracBelgeDto.Response create(AracBelgeRequest req) {
        validateBelgeTuru(req.belgeTuru());
        AracBelge belge = new AracBelge();
        belge.setId(UUID.randomUUID());
        applyRequest(belge, req);
        belgeRepository.save(belge);
        return AracBelgeDto.Response.from(belgeRepository.findById(belge.getId()).orElseThrow());
    }

    public AracBelgeDto.Response update(UUID id, AracBelgeRequest req) {
        validateBelgeTuru(req.belgeTuru());
        AracBelge belge = belgeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Belge bulunamadı."));
        applyRequest(belge, req);
        belgeRepository.save(belge);
        return AracBelgeDto.Response.from(belgeRepository.findById(id).orElseThrow());
    }

    public void delete(UUID id) {
        if (!belgeRepository.existsById(id)) {
            throw new NoSuchElementException("Belge bulunamadı.");
        }
        belgeRepository.deleteById(id);
    }

    public List<AracBelgeDto.Response> getUyarilar(int gun) {
        return belgeRepository.findTumGuncel().stream()
                .filter(b -> b.getKalanGun() <= gun)
                .sorted(Comparator.comparingLong(AracBelge::getKalanGun))
                .map(AracBelgeDto.Response::from)
                .toList();
    }

    public List<AracBelgeDto.Response> getOzet(UUID aracId) {
        return belgeRepository.findGuncelByAracId(aracId)
                .stream().map(AracBelgeDto.Response::from).toList();
    }

    public AracBelgeDto.DurumSayim getDashboardSayim() {
        List<AracBelge> guncel = belgeRepository.findTumGuncel();
        long valid    = guncel.stream().filter(b -> b.getDurum() == BelgeDurum.VALID).count();
        long warning  = guncel.stream().filter(b -> b.getDurum() == BelgeDurum.WARNING).count();
        long critical = guncel.stream().filter(b -> b.getDurum() == BelgeDurum.CRITICAL).count();
        long expired  = guncel.stream().filter(b -> b.getDurum() == BelgeDurum.EXPIRED).count();
        return new AracBelgeDto.DurumSayim(valid, warning, critical, expired);
    }

    public List<YaklasanBelgeDto> getYaklasan(int gun, String belgeTuru, Integer subeId, Integer bolgeId, String siralama) {
        List<AracBelge> guncel = belgeRepository.findTumGuncel();

        Comparator<AracBelge> comparator;
        String sort = siralama != null ? siralama : "";
        if ("belge_turu".equals(sort)) {
            comparator = Comparator.comparing(AracBelge::getBelgeTuru)
                    .thenComparingLong(AracBelge::getKalanGun);
        } else if ("bolge".equals(sort)) {
            comparator = Comparator.comparing((AracBelge b) -> {
                Sube s = b.getArac().getSube();
                return s != null && s.getBolge() != null ? s.getBolge().getAd() : "";
            });
        } else {
            comparator = Comparator.comparingLong(AracBelge::getKalanGun);
        }

        return guncel.stream()
                .filter(b -> b.getKalanGun() <= gun)
                .filter(b -> belgeTuru == null || belgeTuru.isBlank() || b.getBelgeTuru().equals(belgeTuru))
                .filter(b -> subeId == null || (b.getArac().getSube() != null && subeId.equals(b.getArac().getSube().getId())))
                .filter(b -> bolgeId == null || (b.getArac().getSube() != null
                        && b.getArac().getSube().getBolge() != null
                        && bolgeId.equals(b.getArac().getSube().getBolge().getId())))
                .sorted(comparator)
                .map(this::toYaklasanDto)
                .toList();
    }

    private YaklasanBelgeDto toYaklasanDto(AracBelge b) {
        BelgeDurum durum = b.getDurum();
        var arac = b.getArac();
        var sube = arac.getSube();
        var bolge = sube != null ? sube.getBolge() : null;
        var depo = bolge != null ? bolge.getDepo() : null;
        var firma = arac.getFirma();
        return new YaklasanBelgeDto(
                b.getId(),
                b.getBelgeTuru(),
                b.getBitisTarihi(),
                b.getKalanGun(),
                durum.name().toLowerCase(),
                durum.getRenk(),
                arac.getId(),
                arac.getPlaka(),
                arac.getTur() != null ? arac.getTur().getAd() : null,
                sube != null ? sube.getId() : null,
                sube != null ? sube.getAd() : null,
                bolge != null ? bolge.getAd() : null,
                depo != null ? depo.getAd() : null,
                firma != null ? firma.getId() : null,
                firma != null ? firma.getAd() : null
        );
    }

    private void validateBelgeTuru(String belgeTuru) {
        if (!BelgeTuru.isValid(belgeTuru)) {
            throw new IllegalArgumentException("Geçersiz belge türü: " + belgeTuru);
        }
    }

    private void applyRequest(AracBelge belge, AracBelgeRequest req) {
        belge.setArac(aracRepository.getReferenceById(req.aracId()));
        belge.setBelgeTuru(req.belgeTuru());
        belge.setBaslangicTarihi(req.baslangicTarihi());
        belge.setBitisTarihi(req.bitisTarihi());
        belge.setPoliceNo(req.policeNo());
        belge.setKurum(req.kurum());
        belge.setTutar(req.tutar());
        belge.setNotlar(req.notlar());
    }
}

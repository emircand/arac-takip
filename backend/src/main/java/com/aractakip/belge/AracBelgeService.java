package com.aractakip.belge;

import com.aractakip.arac.AracRepository;
import com.aractakip.belge.dto.AracBelgeDto;
import com.aractakip.belge.dto.AracBelgeRequest;
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

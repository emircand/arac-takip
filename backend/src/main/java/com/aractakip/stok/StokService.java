package com.aractakip.stok;

import com.aractakip.ariza.Ariza;
import com.aractakip.stok.dto.StokDto;
import com.aractakip.stok.dto.StokGirisRequest;
import com.aractakip.stok.dto.StokRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StokService {

    private final StokKalemRepository stokKalemRepository;
    private final StokHareketRepository stokHareketRepository;

    @Transactional(readOnly = true)
    public List<StokDto.Response> list() {
        return stokKalemRepository.findAllByOrderByStokAdiAsc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StokDto.Response> kritikList(BigDecimal esik) {
        return stokKalemRepository.findKritik(esik)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<StokDto.Response> ara(String q) {
        return stokKalemRepository.findByStokAdiContainingIgnoreCaseOrderByStokAdiAsc(q)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public StokDto.Response create(StokRequest req) {
        StokKalem k = new StokKalem();
        k.setStokAdi(req.stokAdi());
        k.setKodu(req.kodu());
        k.setBirim(req.birim() != null ? req.birim() : "ADET");
        k.setDevir(req.devir() != null ? req.devir() : BigDecimal.ZERO);
        k.setGiris(req.giris() != null ? req.giris() : BigDecimal.ZERO);
        stokKalemRepository.save(k);
        return toResponse(k);
    }

    @Transactional
    public StokDto.Response update(UUID id, StokRequest req) {
        StokKalem k = findOrThrow(id);
        k.setStokAdi(req.stokAdi());
        k.setKodu(req.kodu());
        if (req.birim() != null) k.setBirim(req.birim());
        if (req.devir() != null) k.setDevir(req.devir());
        if (req.giris() != null) k.setGiris(req.giris());
        stokKalemRepository.save(k);
        return toResponse(k);
    }

    @Transactional
    public StokDto.Response girisYap(UUID id, StokGirisRequest req) {
        StokKalem k = findOrThrow(id);
        k.setGiris(k.getGiris().add(req.miktar()));
        stokKalemRepository.save(k);

        StokHareket h = new StokHareket();
        h.setStokKalem(k);
        h.setTip("giris");
        h.setMiktar(req.miktar());
        h.setAciklama(req.aciklama());
        stokHareketRepository.save(h);

        return toResponse(k);
    }

    /** Arıza tamamlanmasında çağrılır — transaction dışından girilmez, çağıran @Transactional olmalı */
    public void cikisYap(StokKalem kalem, BigDecimal miktar, Ariza ariza) {
        kalem.setCikis(kalem.getCikis().add(miktar));
        stokKalemRepository.save(kalem);

        StokHareket h = new StokHareket();
        h.setStokKalem(kalem);
        h.setTip("cikis");
        h.setMiktar(miktar);
        h.setAriza(ariza);
        h.setAciklama("Arıza tamamlama: " + ariza.getBaslik());
        stokHareketRepository.save(h);
    }

    public StokKalem findOrThrow(UUID id) {
        return stokKalemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stok kalemi bulunamadı: " + id));
    }

    private StokDto.Response toResponse(StokKalem k) {
        return new StokDto.Response(
                k.getId(),
                k.getStokAdi(),
                k.getKodu(),
                k.getBirim(),
                k.getDevir(),
                k.getGiris(),
                k.getCikis(),
                k.getBakiye(),
                k.getCreatedAt()
        );
    }
}

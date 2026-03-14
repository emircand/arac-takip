package com.aractakip.ariza;

import com.aractakip.arac.AracRepository;
import com.aractakip.ariza.dto.*;
import com.aractakip.sofor.SoforRepository;
import com.aractakip.stok.StokKalem;
import com.aractakip.stok.StokKalemRepository;
import com.aractakip.stok.StokService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArizaService {

    private final ArizaRepository arizaRepository;
    private final ArizaHareketRepository hareketRepository;
    private final ArizaParcaRepository parcaRepository;
    private final AracRepository aracRepository;
    private final SoforRepository soforRepository;
    private final StokKalemRepository stokKalemRepository;
    private final StokService stokService;

    // ─── List ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ArizaDto.Response> list(UUID aracId, String durum) {
        List<Ariza> kayitlar;
        if (aracId != null) {
            kayitlar = arizaRepository.findByAracIdOrderByCreatedAtDesc(aracId);
            if (durum != null) {
                kayitlar = kayitlar.stream().filter(a -> durum.equals(a.getDurum())).toList();
            }
        } else if (durum != null) {
            kayitlar = arizaRepository.findByDurumOrderByCreatedAtDesc(durum);
        } else {
            kayitlar = arizaRepository.findAllByOrderByCreatedAtDesc();
        }
        return kayitlar.stream().map(this::toResponse).toList();
    }

    // ─── Detail ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ArizaDto.Detail getDetail(UUID id) {
        Ariza ariza = findOrThrow(id);
        List<ArizaDto.ParcaResponse> parcalar = parcaRepository
                .findByArizaIdOrderByCreatedAtAsc(id)
                .stream().map(this::toParcaResponse).toList();
        List<ArizaDto.HareketResponse> hareketler = hareketRepository
                .findByArizaIdOrderByCreatedAtAsc(id)
                .stream().map(this::toHareketResponse).toList();
        return toDetail(ariza, parcalar, hareketler);
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    @Transactional
    public ArizaDto.Response create(ArizaRequest req) {
        Ariza ariza = new Ariza();
        ariza.setArac(aracRepository.getReferenceById(req.aracId()));
        if (req.soforId() != null) {
            ariza.setSofor(soforRepository.getReferenceById(req.soforId()));
        }
        ariza.setBaslik(req.baslik());
        ariza.setAciklama(req.aciklama());
        ariza.setDurum("acik");
        ariza.setCalisalamaz(req.calisalamaz());
        ariza.setBildirimZamani(req.calisalamaz() ? req.bildirimZamani() : null);
        ariza.setIslemYapan(req.islemYapan());
        arizaRepository.save(ariza);

        logHareket(ariza, null, "acik", "Arıza oluşturuldu");

        return toResponse(ariza);
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    @Transactional
    public ArizaDto.Response update(UUID id, ArizaRequest req) {
        Ariza ariza = findOrThrow(id);
        ariza.setBaslik(req.baslik());
        ariza.setAciklama(req.aciklama());
        ariza.setSofor(req.soforId() != null ? soforRepository.getReferenceById(req.soforId()) : null);
        ariza.setCalisalamaz(req.calisalamaz());
        ariza.setBildirimZamani(req.calisalamaz() ? req.bildirimZamani() : null);
        ariza.setIslemYapan(req.islemYapan());
        arizaRepository.save(ariza);
        return toResponse(ariza);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID id) {
        Ariza ariza = findOrThrow(id);
        if (!"acik".equals(ariza.getDurum())) {
            throw new IllegalArgumentException("Yalnızca 'acik' durumundaki arızalar silinebilir");
        }
        arizaRepository.delete(ariza);
    }

    // ─── Durum Değiştir ──────────────────────────────────────────────────────

    @Transactional
    public ArizaDto.Response changeDurum(UUID id, ArizaDurumRequest req) {
        Ariza ariza = findOrThrow(id);
        String eskiDurum = ariza.getDurum();
        ariza.setDurum(req.durum());
        if (req.islemYapan() != null) ariza.setIslemYapan(req.islemYapan());
        if (req.tamamlannaNotu() != null) ariza.setTamamlannaNotu(req.tamamlannaNotu());
        if ("tamamlandi".equals(req.durum())) {
            ariza.setTamamlandiAt(Instant.now());
        }
        arizaRepository.save(ariza);
        logHareket(ariza, eskiDurum, req.durum(), req.aciklama());
        return toResponse(ariza);
    }

    // ─── Tamamla ─────────────────────────────────────────────────────────────

    @Transactional
    public ArizaDto.Response tamamla(UUID id) {
        Ariza ariza = findOrThrow(id);
        if ("tamamlandi".equals(ariza.getDurum())) {
            throw new IllegalArgumentException("Arıza zaten tamamlandı");
        }
        String eskiDurum = ariza.getDurum();

        List<ArizaParca> parcalar = parcaRepository.findByArizaIdOrderByCreatedAtAsc(id);
        for (ArizaParca p : parcalar) {
            if (!p.isKullanildi()) {
                p.setKullanildi(true);
                // Stok bağlı ise gerçek düşüm yap
                if (p.getStokKalem() != null) {
                    stokService.cikisYap(p.getStokKalem(), p.getMiktar(), ariza);
                }
            }
        }
        parcaRepository.saveAll(parcalar);

        ariza.setDurum("tamamlandi");
        ariza.setTamamlandiAt(Instant.now());
        arizaRepository.save(ariza);
        logHareket(ariza, eskiDurum, "tamamlandi", "Arıza tamamlandı");

        return toResponse(ariza);
    }

    // ─── Sayım ───────────────────────────────────────────────────────────────

    public ArizaDto.Sayim getSayim() {
        return new ArizaDto.Sayim(
                arizaRepository.countByDurum("acik"),
                arizaRepository.countByDurum("devam"),
                arizaRepository.countByDurum("tamamlandi"),
                arizaRepository.countByDurum("iptal")
        );
    }

    // ─── Parça Ekle ──────────────────────────────────────────────────────────

    @Transactional
    public ArizaDto.ParcaResponse addParca(UUID arizaId, ArizaParcaRequest req) {
        Ariza ariza = findOrThrow(arizaId);
        ArizaParca parca = new ArizaParca();
        parca.setAriza(ariza);
        parca.setParcaAdi(req.parcaAdi());
        parca.setMiktar(req.miktar() != null ? req.miktar() : java.math.BigDecimal.ONE);
        parca.setBirim(req.birim() != null ? req.birim() : "ADET");
        if (req.stokId() != null) {
            StokKalem kalem = stokKalemRepository.findById(req.stokId())
                    .orElseThrow(() -> new IllegalArgumentException("Stok kalemi bulunamadı: " + req.stokId()));
            parca.setStokKalem(kalem);
            // parcaAdi boşsa stok adını kullan
            if (req.parcaAdi() == null || req.parcaAdi().isBlank()) {
                parca.setParcaAdi(kalem.getStokAdi());
            }
        }
        parcaRepository.save(parca);
        return toParcaResponse(parca);
    }

    // ─── Parça Sil ───────────────────────────────────────────────────────────

    @Transactional
    public void deleteParca(UUID parcaId) {
        ArizaParca parca = parcaRepository.findById(parcaId)
                .orElseThrow(() -> new IllegalArgumentException("Parça bulunamadı: " + parcaId));
        if (parca.isKullanildi()) {
            throw new IllegalArgumentException("Kullanılmış parça silinemez");
        }
        parcaRepository.delete(parca);
    }

    // ─── Yardımcılar ─────────────────────────────────────────────────────────

    private Ariza findOrThrow(UUID id) {
        return arizaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Arıza bulunamadı: " + id));
    }

    private void logHareket(Ariza ariza, String eskiDurum, String yeniDurum, String aciklama) {
        ArizaHareket h = new ArizaHareket();
        h.setAriza(ariza);
        h.setEskiDurum(eskiDurum);
        h.setYeniDurum(yeniDurum);
        h.setAciklama(aciklama);
        hareketRepository.save(h);
    }

    private ArizaDto.Response toResponse(Ariza a) {
        return new ArizaDto.Response(
                a.getId(),
                a.getArac().getId(),
                a.getArac().getPlaka(),
                a.getSofor() != null ? a.getSofor().getId() : null,
                a.getSofor() != null ? a.getSofor().getAdSoyad() : null,
                a.getBaslik(),
                a.getAciklama(),
                a.getDurum(),
                a.isCalisalamaz(),
                a.getBildirimZamani(),
                a.getIslemYapan(),
                a.getTamamlannaNotu(),
                a.getTamamlandiAt(),
                a.getCreatedAt()
        );
    }

    private ArizaDto.Detail toDetail(Ariza a, List<ArizaDto.ParcaResponse> parcalar,
                                     List<ArizaDto.HareketResponse> hareketler) {
        return new ArizaDto.Detail(
                a.getId(),
                a.getArac().getId(),
                a.getArac().getPlaka(),
                a.getSofor() != null ? a.getSofor().getId() : null,
                a.getSofor() != null ? a.getSofor().getAdSoyad() : null,
                a.getBaslik(),
                a.getAciklama(),
                a.getDurum(),
                a.isCalisalamaz(),
                a.getBildirimZamani(),
                a.getIslemYapan(),
                a.getTamamlannaNotu(),
                a.getTamamlandiAt(),
                a.getCreatedAt(),
                parcalar,
                hareketler
        );
    }

    private ArizaDto.ParcaResponse toParcaResponse(ArizaParca p) {
        return new ArizaDto.ParcaResponse(
                p.getId(),
                p.getStokKalem() != null ? p.getStokKalem().getId() : null,
                p.getStokKalem() != null ? p.getStokKalem().getStokAdi() : null,
                p.getParcaAdi(),
                p.getMiktar(),
                p.getBirim(),
                p.isKullanildi(),
                p.getCreatedAt()
        );
    }

    private ArizaDto.HareketResponse toHareketResponse(ArizaHareket h) {
        return new ArizaDto.HareketResponse(
                h.getId(),
                h.getEskiDurum(),
                h.getYeniDurum(),
                h.getAciklama(),
                h.getCreatedAt()
        );
    }
}

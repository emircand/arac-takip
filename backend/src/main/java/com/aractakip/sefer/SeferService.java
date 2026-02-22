package com.aractakip.sefer;

import com.aractakip.arac.AracRepository;
import com.aractakip.sefer.dto.SeferDto;
import com.aractakip.sefer.dto.SeferRequest;
import com.aractakip.sofor.SoforRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeferService {

    private final SeferRepository seferRepository;
    private final AracRepository aracRepository;
    private final SoforRepository soforRepository;

    public List<SeferDto> getAll(LocalDate start, LocalDate end, String bolge,
                                 UUID cekiciId, UUID soforId) {
        return seferRepository
                .findWithFilters(start, end, bolge, cekiciId, soforId)
                .stream()
                .map(SeferDto::from)
                .toList();
    }

    public SeferDto create(SeferRequest req, UUID userId) {
        Sefer sefer = new Sefer();
        sefer.setId(UUID.randomUUID());
        sefer.setGirdiYapan(userId);
        applyRequest(sefer, req);
        checkKmChain(sefer, req);
        seferRepository.save(sefer);
        return SeferDto.from(seferRepository.findById(sefer.getId()).orElseThrow());
    }

    private void checkKmChain(Sefer sefer, SeferRequest req) {
        if (req.cekiciId() == null || req.cikisKm() == null) return;
        List<Sefer> last = seferRepository.findLastByCekiciId(req.cekiciId());
        if (last.isEmpty() || last.get(0).getDonusKm() == null) return;
        int prevDonus = last.get(0).getDonusKm();
        int fark = Math.abs(req.cikisKm() - prevDonus);
        if (fark > 50) {
            sefer.setKmUyari(true);
            sefer.setKmUyariAciklama(String.format(
                "Önceki sefer dönüş km: %d, girilen çıkış km: %d (fark: %d km)",
                prevDonus, req.cikisKm(), fark
            ));
        }
    }

    public SeferDto update(UUID id, SeferRequest req) {
        Sefer sefer = seferRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Sefer bulunamadı."));
        applyRequest(sefer, req);
        seferRepository.save(sefer);
        return SeferDto.from(seferRepository.findById(sefer.getId()).orElseThrow());
    }

    public Integer getLastDonusKm(UUID cekiciId) {
        List<Sefer> last = seferRepository.findLastByCekiciId(cekiciId);
        return last.isEmpty() ? null : last.get(0).getDonusKm();
    }

    public void delete(UUID id) {
        if (!seferRepository.existsById(id)) {
            throw new NoSuchElementException("Sefer bulunamadı.");
        }
        seferRepository.deleteById(id);
    }

    private void applyRequest(Sefer sefer, SeferRequest req) {
        sefer.setTarih(req.tarih());
        sefer.setBolge(req.bolge());
        if (req.cekiciId() != null) {
            sefer.setCekici(aracRepository.getReferenceById(req.cekiciId()));
        }
        if (req.dorseId() != null) {
            sefer.setDorse(aracRepository.getReferenceById(req.dorseId()));
        }
        if (req.soforId() != null) {
            sefer.setSofor(soforRepository.getReferenceById(req.soforId()));
        }
        sefer.setCikisSaati(req.cikisSaati());
        sefer.setDonusSaati(req.donusSaati());
        sefer.setTonaj(req.tonaj());
        sefer.setCikisKm(req.cikisKm());
        sefer.setDonusKm(req.donusKm());
        sefer.setSfrSrs(req.sfrSrs());
        sefer.setSfr(req.sfr() != null ? req.sfr() : 1);
        sefer.setYakit(req.yakit());
        sefer.setNotlar(req.notlar());
    }
}

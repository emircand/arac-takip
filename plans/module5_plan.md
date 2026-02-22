# Module 5 — Document Tracking

## Özet
Araç belgelerini (sigorta, muayene, GPS, kasko) takip et. Geçmiş kayıtları tut. Vade uyarıları göster.

## Tarih Yapısı
```
arac_belgeler: her kayıt = bir dönem
Güncel belge = MAX(bitis_tarihi) per (arac_id, belge_turu)
Durum: >30g=valid, 15-30=warning, 1-14=critical, ≤0=expired
```

## Zorunluluk (arac_turleri'nden)
- motorlu=T → sigorta + muayene zorunlu
- gps_destekli=T → arvato_gps zorunlu
- motorlu=F → sadece sigorta

---

## Adımlar

### 1. Migration
`V5__document_tracking.sql`
```sql
ALTER TABLE arac_belgeler ADD COLUMN IF NOT EXISTS police_no VARCHAR(50);
ALTER TABLE arac_belgeler ADD COLUMN IF NOT EXISTS kurum VARCHAR(100);
ALTER TABLE arac_belgeler ADD COLUMN IF NOT EXISTS tutar DECIMAL(12,2);

ALTER TABLE arac_belgeler DROP CONSTRAINT IF EXISTS arac_belgeler_belge_turu_check;
ALTER TABLE arac_belgeler ADD CONSTRAINT arac_belgeler_belge_turu_check 
  CHECK (belge_turu IN ('muayene','sigorta','kasko','arvato_gps','diger'));

CREATE INDEX IF NOT EXISTS idx_arac_belgeler_arac_belge 
  ON arac_belgeler(arac_id, belge_turu, bitis_tarihi DESC);
```

### 2. Backend: belge/
```
BelgeTuru.java      — enum(muayene,sigorta,kasko,arvato_gps,diger)
BelgeDurum.java     — enum(valid,warning,critical,expired) + renk
AracBelge.java      — entity, @Transient getKalanGun(), getDurum()
AracBelgeRepository — findByAracId, findGuncel, findUyarilar, countByDurum
AracBelgeDTO.java   — CreateReq, UpdateReq, Response, AracOzet, DurumSayim
AracBelgeService    — CRUD + validateBelgeTuru + getOzet + getUyarilar
AracBelgeController — endpoints aşağıda
```

**Endpoints:**
```
GET    /api/arac-belgeler?aracId=
GET    /api/arac-belgeler/gecmis?aracId=&belgeTuru=
GET    /api/arac-belgeler/{id}
POST   /api/arac-belgeler
PUT    /api/arac-belgeler/{id}
DELETE /api/arac-belgeler/{id}
GET    /api/arac-belgeler/uyarilar?gun=30
GET    /api/arac-belgeler/ozet/{aracId}
GET    /api/arac-belgeler/dashboard/sayim
```

### 3. Frontend: services/
`aracBelgeler.js` — API calls + BELGE_TURLERI + BELGE_DURUMLARI

### 4. Frontend: components/
```
BelgeDurumBadge.jsx — renkli badge (durum, kalanGun)
BelgelerTab.jsx     — araç seç → özet kartları → form modal → geçmiş modal
```

### 5. Entegrasyon
- TanimlarPage.jsx → "Belgeler" tab ekle
- DashboardPage.jsx → "Belge Uyarıları" kartı (sayım + tıkla→belgeler)

### 6. Test & Docs
- E2E: belge ekle → özet kontrol → uyarı listesi
- API.md, SCHEMA.md güncelle
- MODULES.md → Module 5 = ✅

---

## Checklist
```
[ ] Migration SQL
[ ] Backend (entity→repo→service→controller)
[ ] Frontend service
[ ] Frontend components
[ ] TanimlarPage entegre
[ ] Dashboard kartı
[ ] Docs güncelle
```

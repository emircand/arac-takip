# arac-takip — Proje Özeti

Atık toplama şirketleri için araç filo yönetim sistemi.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, MUI 7 |
| Backend | Spring Boot 3.4.3, Java 21, Spring Security + JWT (jjwt 0.12.6) |
| Veritabanı | PostgreSQL 17 (local Homebrew, port 5432) |
| Auth | Local JWT — token `localStorage`'da `filo_token` key'i ile tutulur |

---

## Mimari

```
Frontend (5173)  ──→  Backend (8080)  ──→  PostgreSQL (5432)
     React              Spring Boot
```

**Backend katmanları** (her domain için tekrarlanan yapı):
```
{domain}/
  ├── {Entity}.java          — @Entity, tablo haritalama
  ├── {Entity}Repository.java — JpaRepository + özel sorgular
  ├── {Entity}Service.java   — iş mantığı
  ├── {Entity}Controller.java — REST endpoint'leri, sadece DTO alır/döner
  └── dto/                   — request / response record'ları
```

**Tüm API yanıtları** `ApiResponse<T>` zarfına sarılır:
```json
{ "success": true, "data": {...} }
{ "success": false, "message": "Hata mesajı" }
```

**Frontend veri akışı:**
```
Page/Component → service (src/services/) → apiClient.js → Backend API
```
- `apiClient.js` tek fetch noktası — token enjeksiyonu, hata yönetimi burada
- Jackson SNAKE_CASE konfigürasyonu: `camelCase` Java alanları otomatik `snake_case` JSON'a çevrilir

---

## Veritabanı Modeli

### Çekirdek tablolar

| Tablo | Açıklama |
|-------|----------|
| `arac_turleri` | cekici / dorse / pikap + özellik flag'leri |
| `araclar` | Araç kaydı; `tur_id → arac_turleri` |
| `soforler` | Şoför bilgisi |
| `profiller` | Kullanıcılar; bcrypt şifre, rol: `saha` / `yonetici` |
| `seferler` | Sefer kaydı; ana işlem tablosu |
| `arac_belgeler` | Araç belgeleri (muayene, sigorta, kasko, arvato_gps, diğer) |

### Seferler tablosu — özel alanlar

| Alan | Tip | Not |
|------|-----|-----|
| `km` | `integer GENERATED` | `donus_km - cikis_km` — **asla set edilmez** |
| `tonaj` | `integer` | **kg** cinsinden |
| `sfr_srs` | integer | Aynı gün yapılan kaçıncı sefer |
| `km_uyari` | boolean | Zincir kontrolü tetiklendiyse true |

### Views (read-only)

| View | İçerik |
|------|--------|
| `cekici_ozet` | Aktif çekici başına sefer/tonaj/km/yakıt/lt_per_100km |
| `sofor_ozet` | Aktif şoför başına sefer/tonaj/km |
| `gunluk_bolge_ozet` | Tarih+bölge bazlı günlük özet |

---

## Kullanıcı Rolleri

| Rol | Erişim |
|-----|--------|
| `saha` | `/login`, `/saha` (sefer giriş), `/tanimlar` (araç/şoför/belge), `/arizalar` |
| `yonetici` | saha'nın her şeyi + `/dashboard`, `/kullanicilar` |

Spring Security'de `ROLE_YONETICI` → `/api/dashboard/**` endpoint'leri korumalı.

---

## Sayfalar & Bileşenler

### Frontend Sayfaları

| Sayfa | Rol | Açıklama |
|-------|-----|----------|
| `/login` | herkese | JWT login formu |
| `/saha` | saha + | Sefer girişi — `TripForm` + `RecentTripsList` |
| `/tanimlar` | saha + | Araç, Şoför, Belge yönetimi — tab yapısı |
| `/dashboard` | yonetici | Özet kartlar + bölge/çekici/şoför tabloları |

### Önemli Bileşenler

| Bileşen | Görev |
|---------|-------|
| `TripForm` | Sefer kayıt/düzenleme formu; çıkış KM otomatik doldurulur |
| `RecentTripsList` | Son seferler listesi; km_uyari sarı vurgulu |
| `BelgelerTab` | Araç seçimi → belge özet kartları → form modal → geçmiş |
| `BelgeDurumBadge` | Renk kodlu belge durum rozeti |
| `SummaryCards` | Dashboard özet kartları (sefer / tonaj / km / yakıt) |
| `SearchableSelect` | Aranabilir dropdown — araç/şoför seçimi için |

---

## İş Kuralları

### Araç Türü Kuralları

- **cekici**: motorlu=T, muayene_zorunlu=T, sigorta_zorunlu=T, gps_destekli=T, sefere_katilabilir=T, dorse_alabilir=T
- **dorse**: motorlu=F, muayene_zorunlu=T, sefere_katilabilir=F
- **pikap**: motorlu=T, muayene_zorunlu=T, sigorta_zorunlu=T, sefere_katilabilir=F

Sefer form dropdown'larında yalnızca `sefere_katilabilir=true AND aktif=true` araçlar gösterilir.

Şoför yalnızca `cekici` tipine atanabilir.

### Sefer Kuralları

- `cekici_id` zorunlu; `dorse_id` opsiyonel
- Sefer form gönderiminde `sfr` her zaman `1` gönderilir
- `tonaj` **kg** cinsinden integer girilir ve saklanır

### KM Zincir Kontrolü

`POST /api/seferler` sırasında otomatik çalışır:

1. Aynı çekicinin son seferinin `donus_km`'i bulunur
2. `|yeni_cikis_km - son_donus_km| > 50` ise:
   - `km_uyari = true`
   - `km_uyari_aciklama` alanına fark yazılır
3. Yanıtta `warning` alanı dolar

### Belge Durum Hesaplama

`AracBelge.getKalanGun()` = `bitis_tarihi - bugün` (gün cinsinden, `@Transient`)

| Kalan Gün | Durum | Renk |
|-----------|-------|------|
| > 30 | VALID | green |
| 15 – 30 | WARNING | orange |
| 1 – 14 | CRITICAL | red |
| ≤ 0 | EXPIRED | grey |

Güncel belge = aynı `(arac_id, belge_turu)` çifti için en yüksek `bitis_tarihi`.

Belge türüne göre zorunluluk:
- `motorlu=T` → `sigorta` + `muayene` zorunlu
- `gps_destekli=T` → `arvato_gps` zorunlu
- `motorlu=F` → yalnızca `muayene`

### Yakıt Anomali Kuralı (Modül 6 — henüz implemente edilmedi)

- `lt/100km = (toplam_litre / toplam_km) × 100`
- Eşik: 40 lt/100km (anomali flag)

### Arıza Tamamlama Kuralı (Modül 7 — henüz implemente edilmedi)

`POST /arizalar/:id/tamamla` tek transaction içinde:
1. `ariza_parcalar.kullanildi = true`
2. `malzemeler.stok_miktar` düşürülür
3. `stok_hareketler` kaydı eklenir (hareket_turu='cikis')
4. `arizalar.kapanis_tarihi = now()`

---

## API Özeti

Base URL: `http://localhost:8080/api`
Auth: `Authorization: Bearer <token>` (tüm endpoint'ler, `/api/auth/**` hariç)

| Domain | Endpoint'ler |
|--------|-------------|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Araclar | `GET/POST /araclar`, `PUT/PATCH /araclar/:id`, `GET /arac-turleri`, `GET /araclar/sefere-katilabilir` |
| Soforler | `GET/POST /soforler`, `PUT/PATCH /soforler/:id` |
| Seferler | `GET/POST /seferler`, `PUT/DELETE /seferler/:id` |
| Belgeler | `GET/POST /arac-belgeler`, `PUT/DELETE /arac-belgeler/:id`, `GET /arac-belgeler/uyarilar`, `GET /arac-belgeler/ozet/:aracId`, `GET /arac-belgeler/dashboard/sayim` |
| Dashboard | `GET /dashboard/ozet`, `/dashboard/bolge`, `/dashboard/cekici`, `/dashboard/sofor` |

---

## Modül Durumları

| # | Modül | Durum |
|---|-------|-------|
| 1 | Auth + temel CRUD | ✅ |
| 2 | Frontend → Spring migrasyonu | ✅ |
| 3 | Araç refactoring (tek tablo) | ✅ |
| 4 | KM zincir doğrulama | ✅ |
| 5 | Belge takibi | ✅ (docs güncelleme bekliyor) |
| 6 | Yakıt Excel import | ⬜ |
| 7 | Arıza ticket sistemi | ⬜ |
| 8 | Depo / stok | ⬜ |

---

## Önemli Teknik Notlar

- `ddl-auto: validate` — Hibernate tablo **oluşturmaz/değiştirmez**; tüm şema değişiklikleri SQL ile yapılır
- `km` ve `sfr_suresi` GENERATED kolon — `@Column(insertable=false, updatable=false)`
- İki view (`cekici_ozet`, `gunluk_bolge_ozet`, `sofor_ozet`) `tonaj` kolonuna bağımlı — tip değişikliklerinde view'lar drop/recreate edilmeli
- Spring Security: 401/403 yanıtları JSON döner (`GlobalExceptionHandler` değil, `SecurityConfig`'deki lambda'lar)
- Varsayılan admin: `admin@aractakip.com` / `Admin1234!`

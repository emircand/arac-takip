# Araç Takip — CLAUDE.md

## ÖNEMLİ: Bu dosyayı her oturumda baştan sona oku

---

## Proje Yapısı (Monorepo)

```
arac-takip/
├── frontend/          ← Mevcut React uygulaması (buraya taşındı)
├── backend/           ← YENİ Spring Boot uygulaması
└── CLAUDE.md
```

---

## Frontend — Mevcut Durum (README'ye göre TAMAMLANDI)

### Çalışan özellikler
- React 19 + Vite 7 + Tailwind CSS v4
- Supabase Auth — iki rol: `saha`, `yonetici`
- `AuthContext.jsx` → session + profil (rol dahil)
- `ProtectedRoute` → auth + rol yönlendirme
- `/login` → email + şifre
- `/saha` → sefer giriş formu (çekici + dorse + şoför + tüm alanlar), son 20 sefer listesi
- `/tanimlar` → şoför / çekici / dorse CRUD
- `/dashboard` → özet kartlar + bölge/çekici/şoför bazlı tablolar (sadece yönetici)

### Frontend klasör yapısı
```
frontend/src/
├── contexts/AuthContext.jsx
├── lib/supabaseClient.js
├── services/
│   ├── trips.js
│   ├── soforler.js
│   ├── cekiciler.js
│   └── dorseler.js
├── components/
│   ├── NavBar/
│   ├── ProtectedRoute/
│   ├── TripForm/
│   ├── RecentTripsList/
│   └── SummaryCards/
└── pages/
    ├── LoginPage/
    ├── FieldPage/
    ├── TanimlarPage/
    └── DashboardPage/
```

### Frontend veritabanı (Supabase — mevcut)
```
profiller  → id (auth.users), ad_soyad, rol
soforler   → id, ad_soyad, telefon, aktif
cekiciler  → id, plaka, arac_tipi, aktif
dorseler   → id, plaka, aktif
seferler   → id, girdi_yapan, tarih, bolge,
             cekici_id, dorse_id, sofor_id,
             cikis_saati, donus_saati, sfr_suresi (generated),
             tonaj, cikis_km, donus_km, km (generated),
             sfr_srs, sfr, yakit, notlar
```

---

## Backend — Hedef (Spring Boot)

### Neden Spring Boot?
- Multi-tenant mimari (çoklu firma desteği)
- Özelleştirilebilir raporlama ve anomali tespiti (ileriki aşama)
- React frontend Supabase yerine Spring API'yi çağıracak
- Auth: Spring Security + JWT (Supabase Auth'un yerine geçer)

### Backend klasör yapısı
```
backend/
├── src/main/java/com/aractakip/
│   ├── AracTakipApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java       # JWT + CORS
│   │   └── JwtConfig.java
│   ├── auth/
│   │   ├── AuthController.java       # POST /api/auth/login, /refresh
│   │   ├── AuthService.java
│   │   └── JwtUtil.java
│   ├── common/
│   │   └── TenantContext.java        # Multi-tenant için firma_id thread-local
│   ├── sefer/
│   │   ├── Sefer.java                # Entity
│   │   ├── SeferRepository.java
│   │   ├── SeferService.java
│   │   └── SeferController.java     # /api/seferler
│   ├── sofor/
│   │   ├── Sofor.java
│   │   ├── SoforRepository.java
│   │   ├── SoforService.java
│   │   └── SoforController.java     # /api/soforler
│   ├── cekici/
│   │   ├── Cekici.java
│   │   ├── CekiciRepository.java
│   │   ├── CekiciService.java
│   │   └── CekiciController.java    # /api/cekiciler
│   ├── dorse/
│   │   ├── Dorse.java
│   │   ├── DorseRepository.java
│   │   ├── DorseService.java
│   │   └── DorseController.java     # /api/dorseler
│   └── dashboard/
│       ├── DashboardService.java
│       └── DashboardController.java  # /api/dashboard/ozet, /bolge, /cekici, /sofor
├── src/main/resources/
│   └── application.yml
└── pom.xml
```

### Backend tech stack
```
Java 21
Spring Boot 3.x
Spring Security + JWT (jjwt)
Spring Data JPA
PostgreSQL (aynı DB — Supabase'in Postgres'i)
Maven
```

### API endpoint listesi

**Auth**
```
POST /api/auth/login        → { email, password } → { token, rol, adSoyad }
POST /api/auth/refresh      → token yenile
```

**Seferler**
```
GET    /api/seferler                  → liste (filtreler: tarih, bolge, cekici_id, sofor_id)
GET    /api/seferler/:id              → tek kayıt
POST   /api/seferler                  → yeni sefer
PUT    /api/seferler/:id              → güncelle (sadece girdi_yapan veya yonetici)
DELETE /api/seferler/:id              → sil (sadece girdi_yapan veya yonetici)
```

**Şoförler / Çekiciler / Dorseler**
```
GET    /api/soforler                  → liste (aktif filtresi)
POST   /api/soforler                  → ekle
PUT    /api/soforler/:id              → güncelle
PATCH  /api/soforler/:id/aktif        → aktif/pasif toggle

(cekiciler ve dorseler aynı pattern)
```

**Dashboard**
```
GET /api/dashboard/ozet?donem=bugun|haftabugun|aybugun|ozel&baslangic=&bitis=
GET /api/dashboard/bolge?...
GET /api/dashboard/cekici?...
GET /api/dashboard/sofor?...
```

### Güvenlik kuralları (Spring Security)
- JWT token header: `Authorization: Bearer <token>`
- `saha` rolü: GET + POST + PUT/DELETE (kendi kaydı)
- `yonetici` rolü: her şey
- `/api/auth/**` → herkese açık
- Diğer tüm endpoint'ler → token zorunlu

---

## Geçiş Planı (aşama aşama)

### Aşama 1 — Backend kur, frontend Supabase'de kalsın
1. `backend/` klasörü oluştur, Spring Boot projesi init et
2. Aynı Postgres'e bağlan (Supabase connection string)
3. Tüm entity ve repository'leri yaz
4. GET endpoint'lerini yaz ve test et (Postman/curl)
5. Auth endpoint'ini yaz, JWT üret

### Aşama 2 — Frontend services katmanını taşı
1. `frontend/src/lib/apiClient.js` oluştur (fetch wrapper, JWT header ekler)
2. Her service dosyasını Supabase → apiClient'a çevir:
   - `trips.js` → `/api/seferler`
   - `soforler.js` → `/api/soforler`
   - `cekiciler.js` → `/api/cekiciler`
   - `dorseler.js` → `/api/dorseler`
3. `AuthContext.jsx` → Supabase Auth yerine `/api/auth/login` kullan
4. `supabaseClient.js` dosyasını kaldır

### Aşama 3 — Supabase'i kapat
1. Supabase RLS politikaları devre dışı
2. Supabase Auth kullanımı sona erer
3. Sadece Postgres bağlantısı kalır (ya Supabase Postgres ya da kendi sunucu)

### Aşama 4 — Multi-tenant (ileriki sprint)
- Tüm tablolara `firma_id` alanı ekle
- `TenantContext` ile her request'e firma bilgisi enjekte et
- Firma bazlı veri izolasyonu

### Aşama 5 — Anomali tespiti (ileriki sprint)
- FastAPI microservice (Python)
- Olağandışı tonaj, km, yakıt tüketimi tespiti
- Spring Boot bu servisi çağırır, sonuçları dashboard'da gösterir

---

## Monorepo Kurulum Komutları

```bash
# Mevcut frontend klasörüne taşı
mkdir -p arac-takip/frontend
mv * arac-takip/frontend/   # mevcut dosyaları taşı
cd arac-takip

# Spring Boot backend oluştur (Spring Initializr veya maven)
mkdir backend
cd backend
# dependencies: Spring Web, Spring Security, Spring Data JPA, PostgreSQL Driver, Lombok, jjwt
```

### backend/application.yml
```yaml
spring:
  datasource:
    url: ${DATABASE_URL}           # Supabase Postgres connection string
    username: ${DATABASE_USER}
    password: ${DATABASE_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate           # Tabloları değiştirme, sadece doğrula
    show-sql: false

jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000             # 24 saat

server:
  port: 8080

cors:
  allowed-origins: http://localhost:5173
```

---

## Dikkat Edilecekler

- `km` ve `sfr_suresi` Postgres'te **generated column** — JPA entity'de `@Column(insertable=false, updatable=false)`
- `ddl-auto: validate` kullan — Hibernate tablo oluşturmasın, mevcut Supabase tablolarını bozmayalım
- Frontend geçiş sırasında `supabaseClient.js` ile `apiClient.js` bir süre birlikte yaşayabilir
- CORS ayarı: frontend `localhost:5173`, backend `localhost:8080`

## Kod Standartları

**Frontend (değişmez):**
- İngilizce değişken/fonksiyon isimleri
- Servis katmanında Supabase sorguları (geçiş sonrası: apiClient)
- Component başına klasör: `ComponentAdi/index.jsx`

**Backend:**
- Paket: `com.aractakip`
- Lombok kullan (`@Data`, `@Builder`, `@RequiredArgsConstructor`)
- DTO — Entity ayrımı yap (Controller DTO alır/döner, Service Entity çalışır)
- Her endpoint için anlamlı HTTP status kodu dön
- Exception handling: `@ControllerAdvice` ile merkezi

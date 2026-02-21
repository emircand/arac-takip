# Araç Takip

Çöp toplama filolarını takip etmek için geliştirilmiş web uygulaması. Saha ekibi mobil üzerinden sefer verisi girer; yöneticiler anlık dashboard üzerinden bölge, çekici ve şoför bazlı performansı izler.

## Özellikler

- **Authentication** — JWT tabanlı, iki rol: `saha` ve `yonetici`
- **Saha Ekranı** — Çekici + dorse + şoför kombinasyonuyla sefer girişi. Son 20 sefer listesi, düzenleme ve silme. Mobil öncelikli tasarım.
- **Tanımlar** — Şoför, çekici ve dorse kayıtlarını yönet; aktif/pasif durumu değiştir.
- **Dashboard** (yönetici) — Bugünün özet kartları + Bugün/Bu Hafta/Bu Ay dönem filtresiyle bölge, çekici ve şoför bazlı tablolar.

## Teknoloji

**Frontend**
- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)

**Backend**
- [Spring Boot 3.4](https://spring.io/projects/spring-boot) (Java 21)
- Spring Security 6 — stateless, JWT
- Spring Data JPA + Hibernate 6
- PostgreSQL via [Supabase](https://supabase.com)

## Kurulum

### 1. Repoyu klonlayın

```bash
git clone https://github.com/kullanici/arac-takip.git
cd arac-takip
```

### 2. Frontend

```bash
cd frontend
npm install
```

`frontend/.env` dosyasını oluşturun:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Supabase Dashboard → Settings → API → **anon / public** key

```bash
npm run dev
# http://localhost:5173
```

### 3. Backend

`backend/.env` dosyasını oluşturun:

```env
DATABASE_JDBC_URL=jdbc:postgresql://aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_POOLER_USER=postgres.<project-ref>
DATABASE_PASSWORD=your-db-password
JWT_SECRET=your-base64-secret
SUPABASE_ANON_KEY=your-anon-key
```

> Supabase Dashboard → Settings → Database → **Connection pooling** (Transaction mode, port 6543 veya 5432)

```bash
cd backend
set -a && source .env && set +a
mvn spring-boot:run
# http://localhost:8080
```

### 4. Supabase tablolarını oluşturun

Supabase SQL Editor'da aşağıdaki sorguları çalıştırın:

```sql
-- Kullanıcı profilleri (auth.users ile 1:1)
create table profiller (
  id uuid primary key references auth.users(id) on delete cascade,
  ad_soyad text not null,
  rol text not null check (rol in ('saha', 'yonetici'))
);

-- Şoförler
create table soforler (
  id uuid primary key default gen_random_uuid(),
  ad_soyad text not null,
  telefon text,
  aktif boolean default true
);

-- Çekiciler
create table cekiciler (
  id uuid primary key default gen_random_uuid(),
  plaka text not null unique,
  arac_tipi text default 'Çekici',
  aktif boolean default true
);

-- Dorseler
create table dorseler (
  id uuid primary key default gen_random_uuid(),
  plaka text not null unique,
  aktif boolean default true
);

-- Seferler
create table seferler (
  id uuid primary key default gen_random_uuid(),
  girdi_yapan uuid references auth.users(id),
  tarih date not null,
  bolge text,
  cekici_id uuid references cekiciler(id),
  dorse_id uuid references dorseler(id),
  sofor_id uuid references soforler(id),
  cikis_saati time,
  donus_saati time,
  sfr_suresi interval generated always as (donus_saati - cikis_saati) stored,
  tonaj numeric(10,3),
  cikis_km integer,
  donus_km integer,
  km integer generated always as (donus_km - cikis_km) stored,
  sfr_srs integer,
  sfr integer default 1,
  yakit numeric(8,2),
  notlar text
);
```

## Sayfa Erişimi

| Sayfa | saha | yonetici |
|-------|:----:|:--------:|
| `/login` | ✓ | ✓ |
| `/saha` | ✓ | ✓ |
| `/tanimlar` | ✓ | ✓ |
| `/dashboard` | — | ✓ |
| `/kullanicilar` | — | ✓ |

## Proje Yapısı

```
arac-takip/
├── frontend/
│   └── src/
│       ├── contexts/
│       │   └── AuthContext.jsx          # Session + profil (rol dahil)
│       ├── lib/
│       │   └── supabaseClient.js        # Supabase bağlantısı
│       ├── services/                    # Supabase sorguları (sefer, şoför, çekici, dorse)
│       ├── components/
│       │   ├── NavBar/                  # Rol bazlı navigasyon
│       │   ├── ProtectedRoute/          # Auth + rol yönlendirme
│       │   ├── TripForm/                # Sefer giriş formu
│       │   ├── RecentTripsList/         # Son 20 sefer listesi
│       │   └── SummaryCards/            # Dashboard özet kartları
│       └── pages/
│           ├── LoginPage/
│           ├── FieldPage/               # /saha
│           ├── TanimlarPage/            # /tanimlar
│           ├── DashboardPage/           # /dashboard
│           └── KullanicilarPage/        # /kullanicilar
└── backend/
    └── src/main/java/com/aractakip/
        ├── auth/                        # JWT üretimi, filtre, Supabase auth entegrasyonu
        ├── config/                      # Security, CORS
        ├── common/                      # ApiResponse, GlobalExceptionHandler
        ├── sefer/                       # Sefer entity, repo, service, controller
        ├── sofor/                       # Şoför entity, repo, service, controller
        ├── cekici/                      # Çekici entity, repo, service, controller
        ├── dorse/                       # Dorse entity, repo, service, controller
        ├── profil/                      # Profil entity, repo
        └── dashboard/                   # Özet sorgular (bölge, çekici, şoför bazlı)
```

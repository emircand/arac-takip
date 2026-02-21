# Araç Takip

Çöp toplama filolarını takip etmek için geliştirilmiş web uygulaması. Saha ekibi mobil üzerinden sefer verisi girer; yöneticiler anlık dashboard üzerinden bölge, çekici ve şoför bazlı performansı izler.

## Özellikler

- **Authentication** — Supabase Auth tabanlı, iki rol: `saha` ve `yonetici`
- **Saha Ekranı** — Çekici + dorse + şoför kombinasyonuyla sefer girişi. Son 20 sefer listesi, düzenleme ve silme. Mobil öncelikli tasarım.
- **Tanımlar** — Şoför, çekici ve dorse kayıtlarını yönet; aktif/pasif durumu değiştir.
- **Dashboard** (yönetici) — Bugünün özet kartları + Bugün/Bu Hafta/Bu Ay dönem filtresiyle bölge, çekici ve şoför bazlı tablolar.
- **Supabase Backend** — Postgres tabanlı veri, RLS ile güvenli REST API erişimi.

## Teknoloji

- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Supabase](https://supabase.com) (Postgres + Auth + REST API)
- [Tailwind CSS v4](https://tailwindcss.com)

## Kurulum

### 1. Repoyu klonlayın

```bash
git clone https://github.com/kullanici/arac-takip.git
cd arac-takip
```

### 2. Bağımlılıkları yükleyin

```bash
npm install
```

### 3. Ortam değişkenlerini ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasını açıp Supabase bilgilerinizi girin:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Supabase Dashboard → Settings → API → **anon / public** key

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

RLS politikalarını ve kullanıcı kayıt trigger'larını Supabase Dashboard üzerinden ayarlayın.

### 5. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

## Sayfa Erişimi

| Sayfa | saha | yonetici |
|-------|:----:|:--------:|
| `/login` | ✓ | ✓ |
| `/saha` | ✓ | ✓ |
| `/tanimlar` | ✓ | ✓ |
| `/dashboard` | — | ✓ |

## Proje Yapısı

```
src/
├── contexts/
│   └── AuthContext.jsx          # Session + profil (rol dahil)
├── lib/
│   └── supabaseClient.js        # Supabase bağlantısı
├── services/
│   ├── trips.js                 # Sefer sorguları
│   ├── soforler.js              # Şoför sorguları
│   ├── cekiciler.js             # Çekici sorguları
│   └── dorseler.js              # Dorse sorguları
├── components/
│   ├── NavBar/                  # Rol bazlı navigasyon
│   ├── ProtectedRoute/          # Auth + rol yönlendirme
│   ├── TripForm/                # Sefer giriş formu
│   ├── RecentTripsList/         # Son 20 sefer listesi
│   └── SummaryCards/            # Dashboard özet kartları
└── pages/
    ├── LoginPage/               # Giriş ekranı
    ├── FieldPage/               # Saha ekranı (/saha)
    ├── TanimlarPage/            # Şoför/çekici/dorse tanımları
    └── DashboardPage/           # Yönetici dashboard
```

## Veri Modeli

**profiller** — kullanıcı adı, rol (`saha` / `yonetici`)
**soforler** — ad soyad, telefon, aktif
**cekiciler** — plaka, araç tipi, aktif
**dorseler** — plaka, aktif
**seferler** — tarih, bölge, çekici, dorse, şoför, çıkış/dönüş saati, tonaj, km, yakıt, notlar

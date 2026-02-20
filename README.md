# Araç Takip

Çöp toplama filolarını takip etmek için geliştirilmiş web uygulaması. Saha ekibi mobil üzerinden sefer ve yakıt verisi girer; yöneticiler anlık dashboard üzerinden araç bazlı performansı izler.

## Ekran Görüntüleri

| Saha Girişi | Yönetici Dashboard |
|---|---|
| Sefer ve yakıt formu, mobil uyumlu | Özet kartlar + araç bazlı tablo |

## Özellikler

- **Saha Ekranı** — Araç seçip sefer (tarih, tonaj, rota) veya yakıt (litre, tutar) girişi yapılır. Mobil öncelikli tasarım.
- **Yönetici Dashboard** — Aktif araç sayısı, günlük sefer ve tonaj özetleri. Bugün / Bu Hafta / Bu Ay filtresiyle araç bazlı tablo.
- **Supabase Backend** — Postgres tabanlı gerçek zamanlı veri, REST API ile erişim.

## Teknoloji

- [React 19](https://react.dev) + [Vite 7](https://vite.dev)
- [Supabase](https://supabase.com) (Postgres + REST API)
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

Supabase SQL Editor'da aşağıdaki sorguyu çalıştırın:

```sql
create table araclar (
  id uuid primary key default gen_random_uuid(),
  plaka text not null,
  sofor_adi text not null,
  ilce text,
  arac_tipi text,
  aktif boolean default true,
  created_at timestamptz default now()
);

create table seferler (
  id uuid primary key default gen_random_uuid(),
  arac_id uuid references araclar(id),
  tarih date not null,
  tonaj numeric,
  rota text,
  notlar text,
  created_at timestamptz default now()
);

create table yakitlar (
  id uuid primary key default gen_random_uuid(),
  arac_id uuid references araclar(id),
  tarih date not null,
  litre numeric,
  tutar numeric,
  notlar text,
  created_at timestamptz default now()
);
```

### 5. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır.

## Proje Yapısı

```
src/
├── lib/
│   └── supabaseClient.js       # Supabase bağlantısı
├── services/
│   ├── vehicles.js             # Araç sorguları
│   ├── trips.js                # Sefer sorguları
│   └── fuel.js                 # Yakıt sorguları
├── components/
│   ├── NavBar/
│   ├── TripForm/
│   ├── FuelForm/
│   ├── SummaryCards/
│   └── VehicleTable/
└── pages/
    ├── FieldPage/              # Saha ekibi ekranı
    └── DashboardPage/          # Yönetici ekranı
```

## Veri Modeli

**araclar** — plaka, şoför adı, ilçe, araç tipi, aktif durumu
**seferler** — araç, tarih, tonaj, rota, notlar
**yakitlar** — araç, tarih, litre, tutar, notlar

# Araç Takip Uygulaması — Proje Bilgileri

## Proje Hakkında
Çöp toplama şirketinin araçlarını takip etmek için geliştirilmiş web uygulaması.
Saha ekibi mobil üzerinden veri girer, yöneticiler dashboard'dan takip eder.

## Stack
- **Frontend:** React + Vite
- **Backend/DB:** Supabase (Postgres + REST API)
- **Styling:** Tailwind CSS
- **State:** React Context veya Zustand (basit tutulacak)

## Supabase Bağlantısı
- Supabase URL ve anon key `.env` dosyasında tutulur
- `.env` dosyası: `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY`
- Supabase client: `src/lib/supabaseClient.js`

## Veri Modeli

### araclar
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | otomatik |
| plaka | text | araç plakası |
| sofor_adi | text | şoför adı soyadı |
| ilce | text | atandığı ilçe |
| arac_tipi | text | kamyon, dorser, vb. |
| aktif | boolean | aktif mi? |
| created_at | timestamp | |

### seferler
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | otomatik |
| arac_id | uuid (FK) | araclar tablosuna |
| tarih | date | sefer tarihi |
| tonaj | numeric | taşınan çöp (ton) |
| rota | text | güzergah/bölge |
| notlar | text | opsiyonel not |
| created_at | timestamp | |

### yakitlar
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | otomatik |
| arac_id | uuid (FK) | araclar tablosuna |
| tarih | date | yakıt tarihi |
| litre | numeric | alınan litre |
| tutar | numeric | ödenen TL |
| notlar | text | opsiyonel |
| created_at | timestamp | |

## Ekranlar

### Saha Ekranı (mobil uyumlu, basit)
- Araç seç (dropdown)
- Sefer girişi: tarih, tonaj, rota
- Yakıt girişi: tarih, litre, tutar

### Yönetici Dashboard
- Özet kartlar: toplam araç, bugünkü sefer sayısı, günlük toplam tonaj
- Araç bazlı tablo: her araç için toplam tonaj, sefer sayısı
- İlçe/rota bazlı kırılım
- Tarih filtresi (günlük / aylık)
- Basit çizgi veya bar grafik (tonaj trendi)

### Araç Yönetimi
- Araç listesi (CRUD)
- Yeni araç ekleme formu

## Kod Standartları
- Türkçe değişken/fonksiyon isimleri KULLANMA, İngilizce kullan
- Component'lar `src/components/` altında
- Sayfalar `src/pages/` altında
- Supabase sorguları `src/services/` altında topla
- Her component kendi klasöründe: `ComponentAdi/index.jsx`
- Async işlemlerde loading ve error state'i mutlaka yönet
- Mobil öncelikli tasarım (mobile-first)

## Yapılmaması Gerekenler
- Authentication şimdilik ekleme, sonraya bırak
- Karmaşık state management kurma, basit tut
- Gereksiz kütüphane ekleme

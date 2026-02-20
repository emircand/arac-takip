# Araç Takip Uygulaması — Proje Bilgileri

## Proje Hakkında
Çöp toplama şirketinin araç ve sefer operasyonlarını takip etmek için geliştirilmiş web uygulaması.
Saha personeli mobil üzerinden veri girer, yöneticiler hem veri girer hem dashboard'dan takip eder.
Authentication zorunludur — iki rol vardır: `saha` ve `yonetici`.

## Operasyonel Yapı
- Her sefer bir **çekici** + bir **dorse** kombinasyonundan oluşur
- Çekici ve dorse ayrı plakalı, bağımsız takip edilir
- Aynı çekiciye farklı şoförler binebilir (vardiya sistemi)
- Aynı şoför farklı araçlara binebilir
- Günde birden fazla sefer yapılabilir (SFR SRS ile sıralanır)
- Yakıt bazen sefer bazında, bazen ayrı girilir

## Stack
- **Frontend:** React + Vite
- **Backend/DB:** Supabase (Postgres + REST API + Auth)
- **Styling:** Tailwind CSS
- **State:** React Context (auth state için), local state (component bazlı)

## Supabase Bağlantısı
- Supabase URL ve anon key `.env` dosyasında tutulur
- `.env` dosyası: `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY`
- `.env` dosyasını asla commit etme, `.gitignore`'a ekle
- Supabase client: `src/lib/supabaseClient.js`
- Service role key asla frontend'de kullanılmaz

## Authentication Yapısı

### Kullanıcı Rolleri
- `saha` → tüm veri girişlerini yapabilir (sefer, şoför, çekici, dorse)
- `yonetici` → saha personelinin yapabildiği her şeyi yapabilir + dashboard + kullanıcı yönetimi

### Rol Nasıl Tutulur
- `profiller` tablosunda `rol` alanında tutulur
- Kullanıcı kendi rolünü değiştiremez — sadece yönetici değiştirebilir
- Yeni kullanıcı kaydı yoktur, hesapları yönetici oluşturur

### React Tarafında Auth Akışı
- `src/contexts/AuthContext.jsx` → session ve profil bilgisini (rol dahil) tüm app'e sağlar
- `src/components/ProtectedRoute/index.jsx` → role göre yönlendirme yapar
- Login sonrası: her iki rol de `/saha` ana sayfasına gider
- Yöneticide ek olarak nav'da Dashboard linki görünür
- Auth yoksa tüm route'lar `/login`'e yönlendirir

### Sayfa Erişim Kuralları
| Sayfa | saha | yonetici |
|-------|------|----------|
| /login | ✓ | ✓ |
| /saha | ✓ | ✓ |
| /tanimlar | ✓ | ✓ |
| /dashboard | ✗ | ✓ |
| /kullanicilar | ✗ | ✓ |

## Veri Modeli

### profiller
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | auth.users.id ile aynı |
| ad_soyad | text | |
| rol | text | 'saha' veya 'yonetici' |

### soforler
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | |
| ad_soyad | text | |
| telefon | text | opsiyonel |
| aktif | boolean | |

### cekiciler
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | |
| plaka | text | unique |
| arac_tipi | text | varsayılan 'Çekici' |
| aktif | boolean | |

### dorseler
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | |
| plaka | text | unique |
| aktif | boolean | |

### seferler (ana tablo)
| alan | tip | açıklama |
|------|-----|----------|
| id | uuid (PK) | |
| girdi_yapan | uuid (FK) | auth.users.id |
| tarih | date | |
| bolge | text | |
| cekici_id | uuid (FK) | cekiciler tablosuna |
| dorse_id | uuid (FK) | dorseler tablosuna |
| sofor_id | uuid (FK) | soforler tablosuna |
| cikis_saati | time | |
| donus_saati | time | |
| sfr_suresi | interval | otomatik hesaplanır (generated) |
| tonaj | numeric(10,3) | |
| cikis_km | integer | |
| donus_km | integer | |
| km | integer | otomatik hesaplanır (generated) |
| sfr_srs | integer | günlük sefer sırası |
| sfr | integer | sefer sayısı (genellikle 1) |
| yakit | numeric(8,2) | litre, opsiyonel |
| notlar | text | |

## Ekranlar

### /login
- Email + şifre formu
- Hata mesajı göster
- Kayıt formu yok

### /saha (saha + yonetici, mobil öncelikli)
- Sefer giriş formu:
  - Tarih, Bölge
  - Çekici seç (dropdown)
  - Dorse seç (dropdown)
  - Şoför seç (dropdown)
  - Çıkış saati, Dönüş saati
  - Tonaj
  - Çıkış KM, Dönüş KM
  - Yakıt (opsiyonel)
  - Notlar
- Son 20 seferin listesi (tarih, bölge, çekici, şoför, tonaj)
- Girilen kaydı düzenleme / silme

### /tanimlar (saha + yonetici)
- Şoför listesi: ekle, düzenle, aktif/pasif
- Çekici listesi: ekle, düzenle, aktif/pasif
- Dorse listesi: ekle, düzenle, aktif/pasif

### /dashboard (sadece yonetici)
**Özet kartlar (bugün):**
- Toplam sefer sayısı
- Toplam tonaj
- Toplam km
- Toplam yakıt

**Filtreler:**
- Tarih aralığı (bugün / bu hafta / bu ay / özel)
- Bölge filtresi
- Çekici filtresi
- Şoför filtresi

**Tablolar:**
- Bölge bazlı: sefer sayısı, toplam tonaj, toplam km, toplam yakıt
- Çekici bazlı: sefer sayısı, toplam tonaj, toplam km, yakıt, lt/100km
- Şoför bazlı: sefer sayısı, toplam tonaj, toplam km

**Grafikler:**
- Günlük tonaj trendi (bar chart, son 30 gün)
- Bölge bazlı tonaj dağılımı (pie veya bar)

### /kullanicilar (sadece yonetici)
- Kullanıcı listesi
- Yeni kullanıcı oluştur
- Rol değiştir

## Kod Standartları
- Türkçe değişken/fonksiyon isimleri KULLANMA, İngilizce kullan
- Component'lar `src/components/` altında
- Sayfalar `src/pages/` altında
- Supabase sorguları `src/services/` altında topla
- Her component kendi klasöründe: `ComponentAdi/index.jsx`
- Async işlemlerde loading ve error state'i mutlaka yönet
- Mobil öncelikli tasarım, sefer giriş formu telefonda rahat kullanılmalı
- Form validasyonu: tonaj, km, saat alanları zorunlu

## Yapılmaması Gerekenler
- Karmaşık state management kurma, basit tut
- Gereksiz kütüphane ekleme
- Service role key'i frontend'e koyma
- RLS'yi kapatma

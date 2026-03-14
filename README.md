# Araç Takip Sistemi (Fleet Management)

Atık toplama şirketleri için geliştirilmiş, kapsamlı araç filo yönetim sistemi. Sefer, yakıt tüketimi, araç belgeleri, arıza takibi ve depo/stok yönetimini tek bir platformda birleştirir.

## 🚀 Teknolojiler (Tech Stack)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + Material UI
- **State/Data Management:** React Query (`@tanstack/react-query`)

### Backend
- **Framework:** Spring Boot 3.4.3
- **Language:** Java 21
- **Security:** Spring Security + JWT Auth
- **Database:** PostgreSQL 17 (Hibernate ile)

---

## 🛠️ Kurulum ve Çalıştırma (Getting Started)

### 1. Veritabanı Hazırlığı (Database Setup)
PostgreSQL veritabanını oluşturun ve gerekli migrasyonları uygulayın:
```bash
# PostgreSQL üzerinde 'aractakip' adında bir veritabanı ve kullanıcı oluşturun
psql -U aractakip -d aractakip -f sql/migration.sql
```
*(Not: Backend tarafında Hibernate 'validate' modunda çalışır. Şema değişiklikleri manuel SQL üzerinden yapılmalıdır.)*

### 2. Backend Çalıştırma (Running the Backend)
```bash
cd backend
# Uygulamayı başlat
./mvnw spring-boot:run

# Testleri çalıştırmak için
./mvnw test
```
*Backend varsayılan olarak `http://localhost:8080` portunda çalışacaktır.*

### 3. Frontend Çalıştırma (Running the Frontend)
```bash
cd frontend
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```
*Frontend varsayılan olarak `http://localhost:5173` portunda çalışacaktır.*

---

## 📁 Proje Yapısı (Project Structure)

```text
arac-takip/
├── frontend/                 # React UI uygulaması
│   └── src/
│       ├── components/       # Tekrar kullanılabilir UI bileşenleri
│       ├── pages/            # Sayfalar
│       └── services/         # API istekleri (apiClient.js)
│
├── backend/                  # Spring Boot REST API
│   └── src/main/java/com/aractakip/
│       ├── config/           # Security, CORS vb. ayarlar
│       ├── common/           # Ortak sınıflar (ApiResponse vb.)
│       └── {domain}/         # Modüller (arac, sefer, sofor vb.)
│
├── docs/                     # Proje dökümantasyonu, şemalar, planlar
└── sql/                      # Veritabanı SQL dosyaları (migration vb.)
```

## 📚 Dokümantasyon

Daha fazla detay için `docs/` klasörüne göz atın:
- `SCHEMA.md` & `db-schema.md`: Veritabanı tabloları ve ilişkileri.
- `API.md`: Backend API referansı.
- `MODULES.md`: Modül geliştirme durumları ve biten/planlanan modüllerin yol haritası.

## 🔑 Kimlik Doğrulama (Auth)
Tüm korumalı API uç noktaları için JWT tabanlı kimlik doğrulama gereklidir. Başarılı girişte alınan token `localStorage` üzerinde `filo_token` adıyla saklanır. Müşteri rollerine (`saha`, `yonetici`) göre farklı yetkilendirmeler uygulanır.

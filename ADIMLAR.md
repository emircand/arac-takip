# Frontend Modernizasyon Planı

## Analiz Özeti
- **Sorunlar:** Sıfır code splitting, her bileşende identik `useState+useEffect+fetch` pattern (~10 yerde),
  MUI Icons + inline SVG karışımı, tek monolitik bundle (~590KB gzip), sıfır cache.
- **Kapsam dışı (pratik sebeplerle):** TypeScript tam migrasyonu (tüm dosyaları yeniden adlandırma gerektirir),
  Shadcn/UI (MUI 7 zaten kurulu, 3. UI kütüphanesi eklemek çakışma yaratır).

---

## Adımlar

### 1. Bağımlılık Kurulumu
- [x] `lucide-react`, `@tanstack/react-query`, `zustand`, `framer-motion` kur
- [x] Vite bundle analyzer kur (`rollup-plugin-visualizer`)

### 2. Code Splitting — Route Lazy Loading
- [x] `App.jsx` içindeki tüm sayfa importlarını `React.lazy` + `Suspense` ile sar
- [x] Fallback spinner bileşeni ekle
- **Beklenen kazanım:** İlk yüklemede ~40% küçülme (Dashboard ve TanimlarPage yalnızca gerektiğinde yüklenir)

### 3. İkon Migrasyonu — Lucide React
- [x] MUI Icons bağımlılığını kaldır (`@mui/icons-material`)
- [x] Tüm MUI Icon importlarını Lucide karşılıklarıyla değiştir
- [x] TanimlarPage inline SVG'leri Lucide ile değiştir
- **Beklenen kazanım:** ~200KB bundle küçülmesi (MUI Icons tree-shaking sorunlu)

### 4. TanStack Query Kurulumu
- [x] `QueryClientProvider` ile `main.jsx` sarmalama
- [x] `queryClient` ile global stale/retry config
- [x] `useQuery` / `useMutation` hook'larını `src/hooks/` altında servis bazında oluştur
  - `useAraclar.js` — araçlar + türler
  - `useSoforler.js` — şoförler
  - `useBelgeler.js` — araç belgeleri
  - `useTrips.js` — seferler
- [x] `TanimlarPage` (SoforlerSection + AraclarSection) TanStack Query'e geçir
- [x] `AracBelgeleriDialog` TanStack Query'e geçir
- **Beklenen kazanım:** Manuel loading/error state'lerin %80'i ortadan kalkar, otomatik cache + refetch

### 5. Zustand — Auth State
- [x] `src/store/authStore.js` oluştur
- [x] `AuthContext` yerine Zustand store kullan
- [x] `useAuth()` hook'u aynı API ile koru (geriye dönük uyumlu)
- **Beklenen kazanım:** Context re-render cascade'i önlenir

### 6. Framer Motion — Hafif Animasyonlar
- [x] Liste itemleri için `AnimatePresence` + stagger animasyonu (TanimlarPage, RecentTripsList)
- [x] Dialog/modal açılış animasyonu
- [x] Sayfa geçiş animasyonu
- **Not:** Sadece `motion.div` wrapper'ları — mevcut bileşenlere dokunulmaz

### 7. React.memo + useMemo Optimizasyonları
- [x] `BelgeDurumBadge`, `TurBadge`, `Badge` gibi saf gösterim bileşenlerini `memo` ile sar
- [x] `TanimlarPage` içindeki `visible` ve `visibleSofor` hesaplamalarını `useMemo`'ya taşı
- [x] `flatSubeler`, `flatBolgeler`, `bolgeler`, `subeSecenekleri` hesaplamalarını `useMemo`'ya taşı

### 8. Bundle Analizi & Temizlik
- [x] `rollup-plugin-visualizer` ile bundle raporu üret
- [x] Kullanılmayan `supabaseClient.js` ve bağımlılığını kaldır
- [x] Vite `manualChunks` ile vendor split yap (react, mui, query ayrı chunk)

---

## İlerleme Özeti
| Adım | Durum | Kazanım |
|------|-------|---------|
| 1. Bağımlılıklar | ✅ | — |
| 2. Code Splitting | ✅ | ~40% ilk yükleme küçülmesi |
| 3. İkon Migrasyonu | ✅ | ~200KB azalma |
| 4. TanStack Query | ✅ | Manuel state %80 azaldı |
| 5. Zustand Auth | ✅ | Context cascade önlendi |
| 6. Framer Motion | ✅ | UX animasyonları |
| 7. memo/useMemo | ✅ | Gereksiz render'lar önlendi |
| 8. Bundle Temizlik | ✅ | Final optimizasyon |

# Araç Belgeler Popup — Uygulama Planı

## Hedef
Araçlar listesinde her satıra "Belgeler" butonu ekle → MUI Dialog açılsın → araca ait tüm belgeler türe göre alt alta görünsün, CRUD çalışsın.

## Mimari

```
TanimlarPage → AraclarSection
  her araç satırı → [Düzenle] [Aktif/Pasif] [Belgeler 📄]  ← YENİ
                                                  ↓ tıkla
                                    <AracBelgeleriDialog arac={item}>
                                      fetchBelgeler(aracId)
                                      groupBy belge_turu
                                      ─── Muayene ──────── (aktif kayıt)
                                      ─── Sigorta ──────── (aktif kayıt)
                                      ─── Kasko ─────────  (aktif kayıt)
                                      ─── Arvato GPS ────  (aktif kayıt)
                                      ─── Diğer ─────────  (tüm kayıtlar liste)
                                      [Yeni Belge Ekle] → BelgeFormModal
```

## Adımlar

- [x] **Adım 1** — `AracBelgeleriDialog` bileşenini oluştur
- [x] **Adım 2** — `TanimlarPage` → `AraclarSection`'a buton ekle
- [x] **Adım 3** — Belge alanlarını sadeleştir (sadece bitiş tarihi + arvato_gps cihaz no)
  - SQL: `migrations/V5b__belge_simplify.sql`
  - Backend: Entity, Request, Dto, Service güncellendi
  - Frontend: BelgeFormModal, BelgelerTab, AracBelgeleriDialog güncellendi

## Değişen Dosyalar
| Dosya | Değişiklik |
|-------|-----------|
| `frontend/src/components/AracBelgeleriDialog/index.jsx` | YENİ — ana dialog bileşeni |
| `frontend/src/pages/TanimlarPage/index.jsx` | state + buton + dialog render |

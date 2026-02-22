-- =============================================================================
-- Module 5 — Document Tracking
-- arac_belgeler tablosunu oluştur (tablo henüz yok).
-- Idempotent: IF NOT EXISTS / ON CONFLICT guards.
-- =============================================================================

BEGIN;

-- ─── arac_belgeler ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS arac_belgeler (
    id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    arac_id          uuid         NOT NULL REFERENCES araclar(id) ON DELETE CASCADE,
    belge_turu       text         NOT NULL
                                  CHECK (belge_turu IN ('muayene','sigorta','kasko','arvato_gps','diger')),
    baslangic_tarihi date         NOT NULL,
    bitis_tarihi     date         NOT NULL,
    police_no        varchar(50),
    kurum            varchar(100),
    tutar            numeric(12,2),
    notlar           text,
    created_at       timestamptz  NOT NULL DEFAULT now()
);

-- ─── Index: araç+belge türü bazlı sorgular için ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_arac_belgeler_arac_belge
    ON arac_belgeler(arac_id, belge_turu, bitis_tarihi DESC);

COMMIT;

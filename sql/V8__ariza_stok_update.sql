-- ── arizalar: yeni alanlar ──────────────────────────────────────────────────
ALTER TABLE arizalar
    ADD COLUMN calisalamaz      boolean      NOT NULL DEFAULT false,
    ADD COLUMN bildirim_zamani  timestamptz,
    ADD COLUMN islem_yapan      varchar(100),
    ADD COLUMN tamamlanma_notu  varchar(100);

-- ── ariza_parcalar: stok bağlantısı ve birim ────────────────────────────────
-- stok_id önce eklenir, FK constraint stok_kalemleri tablosu oluştuktan sonra
ALTER TABLE ariza_parcalar
    ADD COLUMN birim   varchar(20) NOT NULL DEFAULT 'ADET';

-- ── stok_kalemleri ──────────────────────────────────────────────────────────
CREATE TABLE stok_kalemleri (
    id       uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
    stok_adi varchar(200)  NOT NULL,
    kodu     varchar(50)   UNIQUE,
    birim    varchar(20)   NOT NULL DEFAULT 'ADET',
    devir    numeric(10,2) NOT NULL DEFAULT 0,
    giris    numeric(10,2) NOT NULL DEFAULT 0,
    cikis    numeric(10,2) NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON stok_kalemleri(kodu);

-- ── ariza_parcalar: stok_id FK ──────────────────────────────────────────────
ALTER TABLE ariza_parcalar
    ADD COLUMN stok_id uuid REFERENCES stok_kalemleri(id);
CREATE INDEX ON ariza_parcalar(stok_id);

-- ── stok_hareketler ─────────────────────────────────────────────────────────
CREATE TABLE stok_hareketler (
    id       uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
    stok_id  uuid          NOT NULL REFERENCES stok_kalemleri(id),
    tip      varchar(10)   NOT NULL,   -- 'giris' | 'cikis'
    miktar   numeric(10,2) NOT NULL,
    ariza_id uuid          REFERENCES arizalar(id),
    aciklama text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON stok_hareketler(stok_id);
CREATE INDEX ON stok_hareketler(ariza_id);

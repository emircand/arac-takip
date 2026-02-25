-- Module 6: Yakıt alımları tablosu
CREATE TABLE yakitlar (
    id           uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
    arac_id      uuid          NOT NULL REFERENCES araclar(id),
    tarih        timestamptz   NOT NULL,
    miktar_lt    numeric(8,2)  NOT NULL,
    tutar        numeric(10,2),
    istasyon     varchar(200),
    istasyon_ili varchar(100),
    utts_no      varchar(50),
    anomali      boolean       NOT NULL DEFAULT false,
    created_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX ON yakitlar(arac_id);
CREATE INDEX ON yakitlar(tarih DESC);
-- Aynı UTTS işlemi iki kez kayıt edilemesin (utts_no boşsa kısıtlama uygulanmaz)
CREATE UNIQUE INDEX yakitlar_utts_no_uq ON yakitlar(utts_no) WHERE utts_no IS NOT NULL;

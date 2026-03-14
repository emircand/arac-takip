CREATE TABLE arizalar (
    id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
    arac_id       uuid         NOT NULL REFERENCES araclar(id),
    sofor_id      uuid         REFERENCES soforler(id),
    baslik        varchar(200) NOT NULL,
    aciklama      text,
    durum         varchar(20)  NOT NULL DEFAULT 'acik',
    tamamlandi_at timestamptz,
    created_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ON arizalar(arac_id);
CREATE INDEX ON arizalar(durum);

CREATE TABLE ariza_hareketler (
    id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    ariza_id   uuid        NOT NULL REFERENCES arizalar(id) ON DELETE CASCADE,
    eski_durum varchar(20),
    yeni_durum varchar(20) NOT NULL,
    aciklama   text,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON ariza_hareketler(ariza_id);

CREATE TABLE ariza_parcalar (
    id         uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
    ariza_id   uuid          NOT NULL REFERENCES arizalar(id) ON DELETE CASCADE,
    parca_adi  varchar(200)  NOT NULL,
    miktar     numeric(8,2)  NOT NULL DEFAULT 1,
    kullanildi boolean       NOT NULL DEFAULT false,
    created_at timestamptz   NOT NULL DEFAULT now()
);
CREATE INDEX ON ariza_parcalar(ariza_id);

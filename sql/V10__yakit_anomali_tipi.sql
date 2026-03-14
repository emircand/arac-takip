-- Faz 1B: Yakıt anomali tipi kolonu
ALTER TABLE yakitlar
    ADD COLUMN IF NOT EXISTS anomali_tipi text
        CHECK (anomali_tipi IN ('hizli_dolum', 'guzergah_disi', 'mesai_disi', 'hayalet_yakit'));

-- Faz 1C: Araç türlerine tank kapasitesi ekle (hayalet yakıt tespiti için)
ALTER TABLE arac_turleri
    ADD COLUMN IF NOT EXISTS tank_kapasitesi_lt integer;

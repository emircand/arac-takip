-- V13: Araç ve şoför bölge (il) ile ilişkilendirilir; sefer ilçe (şube) kaydeder

-- araclar: sube_id → bolge_id
ALTER TABLE araclar ADD COLUMN bolge_id INTEGER REFERENCES bolgeler(id);
UPDATE araclar a
  SET bolge_id = (SELECT s.bolge_id FROM subeler s WHERE s.id = a.sube_id)
  WHERE a.sube_id IS NOT NULL;
ALTER TABLE araclar DROP COLUMN sube_id;

-- soforler: sube_id → bolge_id
ALTER TABLE soforler ADD COLUMN bolge_id INTEGER REFERENCES bolgeler(id);
UPDATE soforler sf
  SET bolge_id = (SELECT s.bolge_id FROM subeler s WHERE s.id = sf.sube_id)
  WHERE sf.sube_id IS NOT NULL;
ALTER TABLE soforler DROP COLUMN sube_id;

-- seferler: ilçe (şube) bilgisini sakla
ALTER TABLE seferler ADD COLUMN sube_id INTEGER REFERENCES subeler(id);

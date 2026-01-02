-- Fix kecamatan mock geometry data (V10 used case-sensitive LIKE)
-- Use ILIKE for case-insensitive matching

-- Menteng district
UPDATE kecamatan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.19, 106.83 -6.19, 106.83 -6.17, 106.81 -6.17, 106.81 -6.19))',
    4326
)) WHERE nama ILIKE '%MENTENG%'
    AND id_kota IN (SELECT id FROM kota WHERE nama ILIKE '%JAKARTA PUSAT%');

-- Tanah Abang district
UPDATE kecamatan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.83 -6.19, 106.85 -6.19, 106.85 -6.17, 106.83 -6.17, 106.83 -6.19))',
    4326
)) WHERE nama ILIKE '%TANAH ABANG%'
    AND id_kota IN (SELECT id FROM kota WHERE nama ILIKE '%JAKARTA PUSAT%');

-- Gambir district
UPDATE kecamatan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.17, 106.83 -6.17, 106.83 -6.15, 106.81 -6.15, 106.81 -6.17))',
    4326
)) WHERE nama ILIKE '%GAMBIR%'
    AND id_kota IN (SELECT id FROM kota WHERE nama ILIKE '%JAKARTA PUSAT%');

-- Fix kelurahan geometry data as well
UPDATE kelurahan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.185, 106.82 -6.185, 106.82 -6.175, 106.81 -6.175, 106.81 -6.185))',
    4326
)) WHERE nama ILIKE '%MENTENG%' AND nama NOT ILIKE '%CIKINI%'
    AND id_kecamatan IN (SELECT id FROM kecamatan WHERE nama ILIKE '%MENTENG%'
        AND id_kota IN (SELECT id FROM kota WHERE nama ILIKE '%JAKARTA PUSAT%'))
LIMIT 1;

UPDATE kelurahan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.82 -6.185, 106.83 -6.185, 106.83 -6.175, 106.82 -6.175, 106.82 -6.185))',
    4326
)) WHERE nama ILIKE '%CIKINI%'
    AND id_kecamatan IN (SELECT id FROM kecamatan WHERE nama ILIKE '%MENTENG%'
        AND id_kota IN (SELECT id FROM kota WHERE nama ILIKE '%JAKARTA PUSAT%'))
LIMIT 1;

UPDATE kelurahan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.175, 106.82 -6.175, 106.82 -6.165, 106.81 -6.165, 106.81 -6.175))',
    4326
)) WHERE nama ILIKE '%GONDANGDIA%'
    AND id_kecamatan IN (SELECT id FROM kecamatan WHERE nama ILIKE '%MENTENG%'
        AND id_kota IN (SELECT id FROM kota WHERE nama ILIKE '%JAKARTA PUSAT%'))
LIMIT 1;

-- Verify updates
DO $$
DECLARE
    kec_count INTEGER;
    kel_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO kec_count FROM kecamatan WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO kel_count FROM kelurahan WHERE geom IS NOT NULL;

    RAISE NOTICE 'Fixed geometry data:';
    RAISE NOTICE '  Districts (kecamatan): % of %', kec_count, (SELECT COUNT(*) FROM kecamatan);
    RAISE NOTICE '  Villages (kelurahan): % of %', kel_count, (SELECT COUNT(*) FROM kelurahan);
END $$;

-- Add mock geometry data for testing the map visualization
-- This creates simple polygon boundaries for selected administrative regions
-- Replace with real GADM data once downloaded

-- Mock geometry for DKI JAKARTA (Province)
-- Approximate bounds: 106.6°E to 106.9°E, -6.4°S to -6.0°S
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.6 -6.4, 106.9 -6.4, 106.9 -6.0, 106.6 -6.0, 106.6 -6.4))',
    4326
)) WHERE kode = '31';

-- Mock geometry for BALI (Province)
-- Approximate bounds: 114.4°E to 115.7°E, -8.8°S to -8.0°S
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((114.4 -8.8, 115.7 -8.8, 115.7 -8.0, 114.4 -8.0, 114.4 -8.8))',
    4326
)) WHERE kode = '51';

-- Mock geometry for JAWA BARAT (Province)
-- Approximate bounds: 106.0°E to 108.9°E, -7.9°S to -6.0°S
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.0 -7.9, 108.9 -7.9, 108.9 -6.0, 106.0 -6.0, 106.0 -7.9))',
    4326
)) WHERE kode = '32';

-- Mock geometry for JAWA TENGAH (Province)
-- Approximate bounds: 108.5°E to 111.5°E, -8.0°S to -6.5°S
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((108.5 -8.0, 111.5 -8.0, 111.5 -6.5, 108.5 -6.5, 108.5 -8.0))',
    4326
)) WHERE kode = '33';

-- Mock geometry for JAWA TIMUR (Province)
-- Approximate bounds: 111.0°E to 114.5°E, -8.8°S to -6.8°S
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((111.0 -8.8, 114.5 -8.8, 114.5 -6.8, 111.0 -6.8, 111.0 -8.8))',
    4326
)) WHERE kode = '35';

-- Mock geometry for SUMATERA UTARA (Province)
-- Approximate bounds: 98.0°E to 100.0°E, 0.5°N to 4.0°N
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((98.0 0.5, 100.0 0.5, 100.0 4.0, 98.0 4.0, 98.0 0.5))',
    4326
)) WHERE kode = '12';

-- Mock geometry for SULAWESI SELATAN (Province)
-- Approximate bounds: 119.0°E to 121.5°E, -7.0°S to -1.5°S
UPDATE provinsi SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((119.0 -7.0, 121.5 -7.0, 121.5 -1.5, 119.0 -1.5, 119.0 -7.0))',
    4326
)) WHERE kode = '73';

-- Mock geometries for cities/regencies (kota) in DKI Jakarta
-- Jakarta Pusat
UPDATE kota SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.78 -6.22, 106.86 -6.22, 106.86 -6.14, 106.78 -6.14, 106.78 -6.22))',
    4326
)) WHERE nama LIKE '%JAKARTA PUSAT%' AND id_provinsi = (SELECT id FROM provinsi WHERE kode = '31');

-- Jakarta Utara
UPDATE kota SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.78 -6.14, 106.92 -6.14, 106.92 -6.06, 106.78 -6.06, 106.78 -6.14))',
    4326
)) WHERE nama LIKE '%JAKARTA UTARA%' AND id_provinsi = (SELECT id FROM provinsi WHERE kode = '31');

-- Jakarta Selatan
UPDATE kota SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.75 -6.37, 106.87 -6.37, 106.87 -6.22, 106.75 -6.22, 106.75 -6.37))',
    4326
)) WHERE nama LIKE '%JAKARTA SELATAN%' AND id_provinsi = (SELECT id FROM provinsi WHERE kode = '31');

-- Mock geometries for cities in Bali
-- Denpasar
UPDATE kota SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((115.17 -8.72, 115.27 -8.72, 115.27 -8.62, 115.17 -8.62, 115.17 -8.72))',
    4326
)) WHERE nama LIKE '%DENPASAR%' AND id_provinsi = (SELECT id FROM provinsi WHERE kode = '51');

-- Badung
UPDATE kota SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((115.1 -8.7, 115.3 -8.7, 115.3 -8.4, 115.1 -8.4, 115.1 -8.7))',
    4326
)) WHERE nama LIKE '%BADUNG%' AND id_provinsi = (SELECT id FROM provinsi WHERE kode = '51');

-- Mock geometries for districts (kecamatan) in Jakarta Pusat
UPDATE kecamatan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.19, 106.83 -6.19, 106.83 -6.17, 106.81 -6.17, 106.81 -6.19))',
    4326
)) WHERE nama LIKE '%MENTENG%'
    AND id_kota IN (SELECT id FROM kota WHERE nama LIKE '%JAKARTA PUSAT%');

UPDATE kecamatan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.83 -6.19, 106.85 -6.19, 106.85 -6.17, 106.83 -6.17, 106.83 -6.19))',
    4326
)) WHERE nama LIKE '%TANAH ABANG%'
    AND id_kota IN (SELECT id FROM kota WHERE nama LIKE '%JAKARTA PUSAT%');

UPDATE kecamatan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.17, 106.83 -6.17, 106.83 -6.15, 106.81 -6.15, 106.81 -6.17))',
    4326
)) WHERE nama LIKE '%GAMBIR%'
    AND id_kota IN (SELECT id FROM kota WHERE nama LIKE '%JAKARTA PUSAT%');

-- Mock geometries for villages (kelurahan) in Menteng district
UPDATE kelurahan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.185, 106.82 -6.185, 106.82 -6.175, 106.81 -6.175, 106.81 -6.185))',
    4326
)) WHERE nama LIKE '%MENTENG%' AND nama NOT LIKE '%CIKINI%'
    AND id_kecamatan IN (SELECT id FROM kecamatan WHERE nama LIKE '%MENTENG%'
        AND id_kota IN (SELECT id FROM kota WHERE nama LIKE '%JAKARTA PUSAT%'))
LIMIT 1;

UPDATE kelurahan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.82 -6.185, 106.83 -6.185, 106.83 -6.175, 106.82 -6.175, 106.82 -6.185))',
    4326
)) WHERE nama LIKE '%CIKINI%'
    AND id_kecamatan IN (SELECT id FROM kecamatan WHERE nama LIKE '%MENTENG%'
        AND id_kota IN (SELECT id FROM kota WHERE nama LIKE '%JAKARTA PUSAT%'))
LIMIT 1;

UPDATE kelurahan SET geom = ST_Multi(ST_GeomFromText(
    'POLYGON((106.81 -6.175, 106.82 -6.175, 106.82 -6.165, 106.81 -6.165, 106.81 -6.175))',
    4326
)) WHERE nama LIKE '%GONDANGDIA%'
    AND id_kecamatan IN (SELECT id FROM kecamatan WHERE nama LIKE '%MENTENG%'
        AND id_kota IN (SELECT id FROM kota WHERE nama LIKE '%JAKARTA PUSAT%'))
LIMIT 1;

-- Add comments for tracking
COMMENT ON COLUMN provinsi.geom IS 'Mock geometry data - replace with GADM import';
COMMENT ON COLUMN kota.geom IS 'Mock geometry data - replace with GADM import';
COMMENT ON COLUMN kecamatan.geom IS 'Mock geometry data - replace with GADM import';
COMMENT ON COLUMN kelurahan.geom IS 'Mock geometry data - replace with GADM import';

-- Summary of mock data coverage
DO $$
DECLARE
    prov_count INTEGER;
    kota_count INTEGER;
    kec_count INTEGER;
    kel_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO prov_count FROM provinsi WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO kota_count FROM kota WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO kec_count FROM kecamatan WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO kel_count FROM kelurahan WHERE geom IS NOT NULL;

    RAISE NOTICE 'Mock geometry data added:';
    RAISE NOTICE '  Provinces: % of %', prov_count, (SELECT COUNT(*) FROM provinsi);
    RAISE NOTICE '  Cities/Regencies: % of %', kota_count, (SELECT COUNT(*) FROM kota);
    RAISE NOTICE '  Districts: % of %', kec_count, (SELECT COUNT(*) FROM kecamatan);
    RAISE NOTICE '  Villages: % of %', kel_count, (SELECT COUNT(*) FROM kelurahan);
END $$;

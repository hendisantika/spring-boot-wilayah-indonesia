-- Match GADM staging table geometries to existing administrative records
-- Uses fuzzy name matching with UPPER() to handle case differences

-- Update Provinsi geometries
UPDATE provinsi p
SET geom = g.geom
FROM gadm_provinsi_staging g
WHERE UPPER(TRIM(p.nama)) = UPPER(TRIM(g.name_1));

-- Verify province match count
DO $$
DECLARE
    matched_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO matched_count FROM provinsi WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO total_count FROM provinsi;
    RAISE NOTICE 'Matched % out of % provinces (%.1f%%)',
        matched_count, total_count, (100.0 * matched_count / NULLIF(total_count, 0));
END $$;

-- Update Kota geometries
UPDATE kota k
SET geom = g.geom
FROM gadm_kota_staging g
INNER JOIN provinsi p ON k.id_provinsi = p.id
WHERE UPPER(TRIM(k.nama)) = UPPER(TRIM(g.name_2))
  AND UPPER(TRIM(p.nama)) = UPPER(TRIM(g.name_1));

-- Verify kota match count
DO $$
DECLARE
    matched_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO matched_count FROM kota WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO total_count FROM kota;
    RAISE NOTICE 'Matched % out of % kota/kabupaten (%.1f%%)',
        matched_count, total_count, (100.0 * matched_count / NULLIF(total_count, 0));
END $$;

-- Update Kecamatan geometries
UPDATE kecamatan kec
SET geom = g.geom
FROM gadm_kecamatan_staging g
INNER JOIN kota k ON kec.id_kota = k.id
INNER JOIN provinsi p ON k.id_provinsi = p.id
WHERE UPPER(TRIM(kec.nama)) = UPPER(TRIM(g.name_3))
  AND UPPER(TRIM(k.nama)) = UPPER(TRIM(g.name_2))
  AND UPPER(TRIM(p.nama)) = UPPER(TRIM(g.name_1));

-- Verify kecamatan match count
DO $$
DECLARE
    matched_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO matched_count FROM kecamatan WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO total_count FROM kecamatan;
    RAISE NOTICE 'Matched % out of % kecamatan (%.1f%%)',
        matched_count, total_count, (100.0 * matched_count / NULLIF(total_count, 0));
END $$;

-- Update Kelurahan geometries
UPDATE kelurahan kel
SET geom = g.geom
FROM gadm_kelurahan_staging g
INNER JOIN kecamatan kec ON kel.id_kecamatan = kec.id
INNER JOIN kota k ON kec.id_kota = k.id
INNER JOIN provinsi p ON k.id_provinsi = p.id
WHERE UPPER(TRIM(kel.nama)) = UPPER(TRIM(g.name_4))
  AND UPPER(TRIM(kec.nama)) = UPPER(TRIM(g.name_3))
  AND UPPER(TRIM(k.nama)) = UPPER(TRIM(g.name_2))
  AND UPPER(TRIM(p.nama)) = UPPER(TRIM(g.name_1));

-- Verify kelurahan match count
DO $$
DECLARE
    matched_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO matched_count FROM kelurahan WHERE geom IS NOT NULL;
    SELECT COUNT(*) INTO total_count FROM kelurahan;
    RAISE NOTICE 'Matched % out of % kelurahan (%.1f%%)',
        matched_count, total_count, (100.0 * matched_count / NULLIF(total_count, 0));
END $$;

-- Drop staging tables after successful match
DROP TABLE IF EXISTS gadm_provinsi_staging;
DROP TABLE IF EXISTS gadm_kota_staging;
DROP TABLE IF EXISTS gadm_kecamatan_staging;
DROP TABLE IF EXISTS gadm_kelurahan_staging;

-- Note: If coverage is low, check unmatched records with:
-- SELECT id, kode, nama FROM provinsi WHERE geom IS NULL;
-- Then create a V10 migration with manual UPDATE statements for specific records

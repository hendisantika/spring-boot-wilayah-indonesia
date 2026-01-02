#!/bin/bash
# Match GADM geometries to existing database records
# Uses normalized name matching (remove spaces, uppercase)
# Usage: ./scripts/match-gadm-to-database.sh

set -e

# Configuration
PG_HOST="localhost"
PG_PORT="5434"
PG_DB="wilayah_indonesia"
PG_USER="yu71"
PG_PASSWORD="53cret"

export PGPASSWORD="$PG_PASSWORD"

echo "========================================="
echo "Matching GADM Data to Database Records"
echo "========================================="
echo ""

# Function to run SQL
run_sql() {
    docker exec db psql -U $PG_USER -d $PG_DB -c "$1"
}

# Function to count matched records
count_matched() {
    docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM $1 WHERE geom IS NOT NULL;" | xargs
}

echo "Step 1: Matching Level 1 (Provinces)..."
echo "  Using normalized name matching..."

run_sql "
    UPDATE provinsi p
    SET geom = g.geom
    FROM gadm_level1_staging g
    WHERE normalize_name(p.nama) = normalize_name(g.name_1);
"

PROVINSI_MATCHED=$(count_matched "provinsi")
PROVINSI_TOTAL=$(docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM provinsi;" | xargs)
echo "✓ Provinces matched: $PROVINSI_MATCHED / $PROVINSI_TOTAL"
echo ""

echo "Step 2: Matching Level 2 (Cities/Regencies)..."
echo "  Using hierarchical matching (province + city name)..."

run_sql "
    UPDATE kota k
    SET geom = g.geom
    FROM gadm_level2_staging g
    INNER JOIN provinsi p ON k.id_provinsi = p.id
    WHERE normalize_name(k.nama) = normalize_name(g.name_2)
      AND normalize_name(p.nama) = normalize_name(g.name_1);
"

KOTA_MATCHED=$(count_matched "kota")
KOTA_TOTAL=$(docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM kota;" | xargs)
echo "✓ Cities matched: $KOTA_MATCHED / $KOTA_TOTAL"
echo ""

echo "Step 3: Matching Level 3 (Districts)..."
echo "  Using hierarchical matching (province + city + district)..."

run_sql "
    UPDATE kecamatan kec
    SET geom = g.geom
    FROM gadm_level3_staging g
    INNER JOIN kota k ON kec.id_kota = k.id
    INNER JOIN provinsi p ON k.id_provinsi = p.id
    WHERE normalize_name(kec.nama) = normalize_name(g.name_3)
      AND normalize_name(k.nama) = normalize_name(g.name_2)
      AND normalize_name(p.nama) = normalize_name(g.name_1);
"

KECAMATAN_MATCHED=$(count_matched "kecamatan")
KECAMATAN_TOTAL=$(docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM kecamatan;" | xargs)
echo "✓ Districts matched: $KECAMATAN_MATCHED / $KECAMATAN_TOTAL"
echo ""

echo "Step 4: Matching Level 4 (Villages)..."
echo "  Using full hierarchical matching..."
echo "  This may take 5-10 minutes due to large dataset..."

run_sql "
    UPDATE kelurahan kel
    SET geom = g.geom
    FROM gadm_level4_staging g
    INNER JOIN kecamatan kec ON kel.id_kecamatan = kec.id
    INNER JOIN kota k ON kec.id_kota = k.id
    INNER JOIN provinsi p ON k.id_provinsi = p.id
    WHERE normalize_name(kel.nama) = normalize_name(g.name_4)
      AND normalize_name(kec.nama) = normalize_name(g.name_3)
      AND normalize_name(k.nama) = normalize_name(g.name_2)
      AND normalize_name(p.nama) = normalize_name(g.name_1);
"

KELURAHAN_MATCHED=$(count_matched "kelurahan")
KELURAHAN_TOTAL=$(docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM kelurahan;" | xargs)
echo "✓ Villages matched: $KELURAHAN_MATCHED / $KELURAHAN_TOTAL"
echo ""

echo "Step 5: Generating match report..."
echo ""
run_sql "
    SELECT
        'Provinsi' as level,
        COUNT(*) as total,
        COUNT(geom) as with_geom,
        ROUND(COUNT(geom)::numeric / COUNT(*)::numeric * 100, 1) || '%' as coverage
    FROM provinsi
    UNION ALL
    SELECT
        'Kota',
        COUNT(*),
        COUNT(geom),
        ROUND(COUNT(geom)::numeric / COUNT(*)::numeric * 100, 1) || '%'
    FROM kota
    UNION ALL
    SELECT
        'Kecamatan',
        COUNT(*),
        COUNT(geom),
        ROUND(COUNT(geom)::numeric / COUNT(*)::numeric * 100, 1) || '%'
    FROM kecamatan
    UNION ALL
    SELECT
        'Kelurahan',
        COUNT(*),
        COUNT(geom),
        ROUND(COUNT(geom)::numeric / COUNT(*)::numeric * 100, 1) || '%'
    FROM kelurahan;
"

echo ""
echo "Step 6: Checking for unmatched records..."
echo ""
echo "Unmatched provinces:"
run_sql "SELECT id, nama FROM provinsi WHERE geom IS NULL ORDER BY nama LIMIT 10;"

echo ""
echo "Unmatched cities (sample):"
run_sql "SELECT k.id, p.nama as provinsi, k.nama FROM kota k INNER JOIN provinsi p ON k.id_provinsi = p.id WHERE k.geom IS NULL ORDER BY p.nama, k.nama LIMIT 10;"

echo ""
echo "========================================="
echo "Matching Complete!"
echo "========================================="
echo ""
echo "Final Coverage:"
echo "  - Provinces: $PROVINSI_MATCHED / $PROVINSI_TOTAL"
echo "  - Cities: $KOTA_MATCHED / $KOTA_TOTAL"
echo "  - Districts: $KECAMATAN_MATCHED / $KECAMATAN_TOTAL"
echo "  - Villages: $KELURAHAN_MATCHED / $KELURAHAN_TOTAL"
echo ""
echo "Next steps:"
echo "1. Review unmatched records above"
echo "2. Create manual fixes for important unmatched records if needed"
echo "3. Test the map at: http://localhost:8080/map"
echo ""
echo "Optional: Drop staging tables to save space:"
echo "  docker exec db psql -U $PG_USER -d $PG_DB -c 'DROP TABLE gadm_level4_staging, gadm_level3_staging, gadm_level2_staging, gadm_level1_staging;'"

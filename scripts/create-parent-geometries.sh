#!/bin/bash
# Create parent-level geometries (provinces, cities, districts) from level 4 data
# by dissolving (unioning) child boundaries
# Usage: ./scripts/create-parent-geometries.sh

set -e

# Configuration
PG_HOST="localhost"
PG_PORT="5434"
PG_DB="wilayah_indonesia"
PG_USER="yu71"
PG_PASSWORD="53cret"

export PGPASSWORD="$PG_PASSWORD"

echo "========================================="
echo "Creating Parent Geometries from Level 4"
echo "========================================="
echo ""

# Function to run SQL
run_sql() {
    docker exec db psql -U $PG_USER -d $PG_DB -c "$1"
}

# Function to count records
count_records() {
    docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM $1;" | xargs
}

echo "Step 1: Creating Level 3 (Districts) by dissolving Level 4..."
echo "  Aggregating ~77,000 villages into ~7,000 districts..."
echo "  This may take 3-5 minutes..."

run_sql "
    INSERT INTO gadm_level3_staging (gid_3, name_1, name_2, name_3, geom)
    SELECT
        gid_3,
        name_1,
        name_2,
        name_3,
        ST_Multi(ST_Union(geom)) as geom
    FROM gadm_level4_staging
    WHERE geom IS NOT NULL
    GROUP BY gid_3, name_1, name_2, name_3
    ORDER BY name_1, name_2, name_3;
"

LEVEL3_COUNT=$(count_records "gadm_level3_staging")
echo "✓ Level 3 created: $LEVEL3_COUNT districts"
echo ""

echo "Step 2: Creating Level 2 (Cities/Regencies) by dissolving Level 3..."
echo "  Aggregating ~7,000 districts into ~500 cities..."
echo "  This may take 2-3 minutes..."

run_sql "
    INSERT INTO gadm_level2_staging (gid_2, name_1, name_2, geom)
    SELECT
        gid_2,
        name_1,
        name_2,
        ST_Multi(ST_Union(geom)) as geom
    FROM gadm_level3_staging
    WHERE geom IS NOT NULL
    GROUP BY gid_2, name_1, name_2
    ORDER BY name_1, name_2;
"

LEVEL2_COUNT=$(count_records "gadm_level2_staging")
echo "✓ Level 2 created: $LEVEL2_COUNT cities/regencies"
echo ""

echo "Step 3: Creating Level 1 (Provinces) by dissolving Level 2..."
echo "  Aggregating ~500 cities into ~38 provinces..."
echo "  This may take 1-2 minutes..."

run_sql "
    INSERT INTO gadm_level1_staging (gid_1, name_1, geom)
    SELECT
        gid_1,
        name_1,
        ST_Multi(ST_Union(geom)) as geom
    FROM gadm_level2_staging
    WHERE geom IS NOT NULL
    GROUP BY gid_1, name_1
    ORDER BY name_1;
"

LEVEL1_COUNT=$(count_records "gadm_level1_staging")
echo "✓ Level 1 created: $LEVEL1_COUNT provinces"
echo ""

echo "Step 4: Sample data verification..."
run_sql "SELECT name_1, name_2 FROM gadm_level2_staging WHERE name_1 ILIKE '%jakarta%' OR name_2 ILIKE '%jakarta%' LIMIT 5;"

echo ""
echo "========================================="
echo "Parent Geometries Created Successfully!"
echo "========================================="
echo "Summary:"
echo "  - Level 1 (Provinces): $LEVEL1_COUNT"
echo "  - Level 2 (Cities): $LEVEL2_COUNT"
echo "  - Level 3 (Districts): $LEVEL3_COUNT"
echo "  - Level 4 (Villages): $(count_records 'gadm_level4_staging')"
echo ""
echo "Next step: Run ./scripts/match-gadm-to-database.sh"

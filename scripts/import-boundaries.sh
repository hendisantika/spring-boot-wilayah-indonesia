#!/bin/bash
# Import Indonesian administrative boundaries from GADM to PostGIS
# Usage: ./import-boundaries.sh /path/to/gadm41_IDN.gpkg

set -e  # Exit on error

GADM_FILE=$1
DB_HOST="localhost"
DB_PORT="5434"
DB_NAME="wilayah_indonesia"
DB_USER="yu71"
DB_PASS="53cret"

if [ -z "$GADM_FILE" ]; then
    echo "Usage: $0 <path-to-gadm-gpkg-file>"
    echo ""
    echo "Example: $0 ~/Downloads/gadm41_IDN.gpkg"
    echo ""
    echo "Download GADM data from: https://gadm.org/download_country.html"
    echo "Select: Indonesia (IDN), Format: Geopackage"
    exit 1
fi

if [ ! -f "$GADM_FILE" ]; then
    echo "Error: File not found: $GADM_FILE"
    exit 1
fi

# Connection string for ogr2ogr
PG_CONN="PG:host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER password=$DB_PASS"

echo "=== Importing GADM boundaries to PostGIS ==="
echo "Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "GADM File: $GADM_FILE"
echo ""

# Import Level 1 (Provinces)
echo "[1/4] Importing provinces (Level 1)..."
ogr2ogr -f "PostgreSQL" "$PG_CONN" \
    "$GADM_FILE" gadm41_IDN_1 \
    -nln gadm_provinsi_staging \
    -nlt PROMOTE_TO_MULTI \
    -lco GEOMETRY_NAME=geom \
    -lco OVERWRITE=YES \
    -t_srs EPSG:4326

echo "✓ Provinces imported to gadm_provinsi_staging"

# Import Level 2 (Regencies/Cities)
echo "[2/4] Importing regencies/cities (Level 2)..."
ogr2ogr -f "PostgreSQL" "$PG_CONN" \
    "$GADM_FILE" gadm41_IDN_2 \
    -nln gadm_kota_staging \
    -nlt PROMOTE_TO_MULTI \
    -lco GEOMETRY_NAME=geom \
    -lco OVERWRITE=YES \
    -t_srs EPSG:4326

echo "✓ Regencies/cities imported to gadm_kota_staging"

# Import Level 3 (Districts)
echo "[3/4] Importing districts (Level 3)..."
ogr2ogr -f "PostgreSQL" "$PG_CONN" \
    "$GADM_FILE" gadm41_IDN_3 \
    -nln gadm_kecamatan_staging \
    -nlt PROMOTE_TO_MULTI \
    -lco GEOMETRY_NAME=geom \
    -lco OVERWRITE=YES \
    -t_srs EPSG:4326

echo "✓ Districts imported to gadm_kecamatan_staging"

# Import Level 4 (Villages)
echo "[4/4] Importing villages (Level 4) - this may take a while..."
ogr2ogr -f "PostgreSQL" "$PG_CONN" \
    "$GADM_FILE" gadm41_IDN_4 \
    -nln gadm_kelurahan_staging \
    -nlt PROMOTE_TO_MULTI \
    -lco GEOMETRY_NAME=geom \
    -lco OVERWRITE=YES \
    -t_srs EPSG:4326

echo "✓ Villages imported to gadm_kelurahan_staging"

echo ""
echo "=== Import completed successfully ==="
echo ""
echo "Next steps:"
echo "1. Restart your Spring Boot application to run the V9 migration"
echo "2. The migration will match GADM geometries to your existing administrative records"
echo "3. Verify geometry coverage with the SQL query in the implementation plan"
echo ""

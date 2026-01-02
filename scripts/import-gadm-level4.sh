#!/bin/bash
# Import GADM Level 4 (villages) GeoJSON data into PostgreSQL staging table
# Usage: ./scripts/import-gadm-level4.sh

set -e

# Configuration
GADM_FILE="src/main/resources/gadm41_IDN_4.json"
PG_HOST="localhost"
PG_PORT="5434"
PG_DB="wilayah_indonesia"
PG_USER="yu71"
PG_PASSWORD="53cret"

echo "========================================="
echo "GADM Level 4 Import Script"
echo "========================================="
echo "File: $GADM_FILE"
echo "Database: $PG_DB@$PG_HOST:$PG_PORT"
echo ""

# Check if file exists
if [ ! -f "$GADM_FILE" ]; then
    echo "ERROR: GADM file not found: $GADM_FILE"
    exit 1
fi

# Check if ogr2ogr is installed
if ! command -v ogr2ogr &> /dev/null; then
    echo "ERROR: ogr2ogr not found. Install with:"
    echo "  brew install gdal  (macOS)"
    echo "  apt install gdal-bin  (Ubuntu/Debian)"
    exit 1
fi

# PostgreSQL connection string
export PGPASSWORD="$PG_PASSWORD"
PG_CONN="PG:host=$PG_HOST port=$PG_PORT dbname=$PG_DB user=$PG_USER password=$PG_PASSWORD"

echo "Step 1: Applying V12 migration to create staging tables..."
docker exec db psql -U $PG_USER -d $PG_DB -f /tmp/V12_20260102__Create_GADM_Staging_Tables.sql 2>/dev/null || true

# Copy migration file to container
docker cp src/main/resources/db/migration/V12_20260102__Create_GADM_Staging_Tables.sql db:/tmp/

# Run migration
docker exec db psql -U $PG_USER -d $PG_DB -f /tmp/V12_20260102__Create_GADM_Staging_Tables.sql

echo "✓ Staging tables created"
echo ""

echo "Step 2: Importing GADM Level 4 data (77,473 villages)..."
echo "This may take 2-5 minutes..."

# Import with ogr2ogr
# -nln: new layer name (table name)
# -lco: layer creation options
# -nlt PROMOTE_TO_MULTI: ensure all geometries are MultiPolygon
# -t_srs EPSG:4326: target spatial reference system
# -overwrite: drop and recreate table if exists

ogr2ogr -f "PostgreSQL" "$PG_CONN" "$GADM_FILE" \
    -nln gadm_level4_staging \
    -nlt PROMOTE_TO_MULTI \
    -lco GEOMETRY_NAME=geom \
    -lco OVERWRITE=YES \
    -t_srs EPSG:4326 \
    -progress

echo "✓ Level 4 data imported"
echo ""

echo "Step 3: Verifying import..."
LEVEL4_COUNT=$(docker exec db psql -U $PG_USER -d $PG_DB -t -c "SELECT COUNT(*) FROM gadm_level4_staging;")
echo "  Villages imported: $LEVEL4_COUNT"

echo ""
echo "========================================="
echo "Import Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/create-parent-geometries.sh"
echo "2. Run: ./scripts/match-gadm-to-database.sh"

-- Create staging tables for GADM data import
-- These will hold the raw GADM geometries before matching to our records

-- Level 4: Villages/Kelurahan (raw import from JSON)
CREATE TABLE IF NOT EXISTS gadm_level4_staging (
    id SERIAL PRIMARY KEY,
    gid_4 VARCHAR(50),
    gid_0 VARCHAR(10),
    country VARCHAR(100),
    gid_1 VARCHAR(50),
    name_1 VARCHAR(255),
    gid_2 VARCHAR(50),
    name_2 VARCHAR(255),
    gid_3 VARCHAR(50),
    name_3 VARCHAR(255),
    name_4 VARCHAR(255),
    varname_4 VARCHAR(255),
    type_4 VARCHAR(100),
    engtype_4 VARCHAR(100),
    cc_4 VARCHAR(50),
    geom geometry(MultiPolygon, 4326)
);

-- Level 3: Districts/Kecamatan (aggregated from level 4)
CREATE TABLE IF NOT EXISTS gadm_level3_staging (
    id SERIAL PRIMARY KEY,
    gid_3 VARCHAR(50),
    name_1 VARCHAR(255),
    name_2 VARCHAR(255),
    name_3 VARCHAR(255),
    geom geometry(MultiPolygon, 4326)
);

-- Level 2: Cities/Kota (aggregated from level 3)
CREATE TABLE IF NOT EXISTS gadm_level2_staging (
    id SERIAL PRIMARY KEY,
    gid_2 VARCHAR(50),
    name_1 VARCHAR(255),
    name_2 VARCHAR(255),
    geom geometry(MultiPolygon, 4326)
);

-- Level 1: Provinces/Provinsi (aggregated from level 2)
CREATE TABLE IF NOT EXISTS gadm_level1_staging (
    id SERIAL PRIMARY KEY,
    gid_1 VARCHAR(50),
    name_1 VARCHAR(255),
    geom geometry(MultiPolygon, 4326)
);

-- Create indexes for faster lookups
CREATE INDEX idx_gadm_level4_names ON gadm_level4_staging(name_1, name_2, name_3, name_4);
CREATE INDEX idx_gadm_level4_geom ON gadm_level4_staging USING GIST(geom);
CREATE INDEX idx_gadm_level3_names ON gadm_level3_staging(name_1, name_2, name_3);
CREATE INDEX idx_gadm_level3_geom ON gadm_level3_staging USING GIST(geom);
CREATE INDEX idx_gadm_level2_names ON gadm_level2_staging(name_1, name_2);
CREATE INDEX idx_gadm_level2_geom ON gadm_level2_staging USING GIST(geom);
CREATE INDEX idx_gadm_level1_names ON gadm_level1_staging(name_1);
CREATE INDEX idx_gadm_level1_geom ON gadm_level1_staging USING GIST(geom);

-- Helper function to normalize names for matching
CREATE OR REPLACE FUNCTION normalize_name(name TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(TRIM(REGEXP_REPLACE(name, '\s+', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_name IS 'Normalize administrative names by removing spaces and converting to uppercase for matching';

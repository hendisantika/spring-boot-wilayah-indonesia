-- Add geometry columns to all administrative level tables
-- SRID 4326 = WGS84 (standard for GPS coordinates and web mapping)

-- Provinsi geometry (MultiPolygon for provinces with multiple islands)
ALTER TABLE provinsi
ADD COLUMN geom geometry(MultiPolygon, 4326);

-- Kota/Kabupaten geometry
ALTER TABLE kota
ADD COLUMN geom geometry(MultiPolygon, 4326);

-- Kecamatan geometry
ALTER TABLE kecamatan
ADD COLUMN geom geometry(MultiPolygon, 4326);

-- Kelurahan geometry
ALTER TABLE kelurahan
ADD COLUMN geom geometry(MultiPolygon, 4326);

-- Create spatial indexes for performance (GIST indexes optimized for spatial queries)
CREATE INDEX idx_provinsi_geom ON provinsi USING GIST (geom);
CREATE INDEX idx_kota_geom ON kota USING GIST (geom);
CREATE INDEX idx_kecamatan_geom ON kecamatan USING GIST (geom);
CREATE INDEX idx_kelurahan_geom ON kelurahan USING GIST (geom);

-- Add comments for documentation
COMMENT ON COLUMN provinsi.geom IS 'Province boundary geometry in WGS84 (EPSG:4326)';
COMMENT ON COLUMN kota.geom IS 'Regency/City boundary geometry in WG84 (EPSG:4326)';
COMMENT ON COLUMN kecamatan.geom IS 'District boundary geometry in WGS84 (EPSG:4326)';
COMMENT ON COLUMN kelurahan.geom IS 'Village boundary geometry in WGS84 (EPSG:4326)';

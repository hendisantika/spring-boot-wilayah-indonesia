package com.hendisantika.controller;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kelurahan;
import com.hendisantika.entity.Kota;
import com.hendisantika.entity.Provinsi;
import com.hendisantika.repository.KecamatanRepository;
import com.hendisantika.repository.KelurahanRepository;
import com.hendisantika.repository.KotaRepository;
import com.hendisantika.repository.ProvinsiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;
/**
 * Created by IntelliJ IDEA.
 * Project : spring-boot-wilayah-indonesia
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 1/02/26
 * Time: 18:49
 * To change this template use File | Settings | File Templates.
 */
/**
 * REST API controller for serving GeoJSON boundary data to map frontend
 */
@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {

    private final ProvinsiRepository provinsiRepository;
    private final KotaRepository kotaRepository;
    private final KecamatanRepository kecamatanRepository;
    private final KelurahanRepository kelurahanRepository;

    /**
     * Get all province boundaries as GeoJSON FeatureCollection
     * Endpoint: GET /api/map/provinsi
     */
    @GetMapping(value = "/provinsi", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getProvinsiBoundaries(
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double maxLat) {

        List<Provinsi> provinsiList;

        // Use bounding box filter if provided (viewport filtering)
        if (minLng != null && minLat != null && maxLng != null && maxLat != null) {
            provinsiList = provinsiRepository.findByBoundingBox(minLng, minLat, maxLng, maxLat);
        } else {
            provinsiList = provinsiRepository.findAllWithGeometry();
        }

        return buildFeatureCollection(
            provinsiList.stream()
                .map(this::provinsiToFeature)
                .collect(Collectors.toList())
        );
    }

    /**
     * Get regency/city boundaries as GeoJSON FeatureCollection
     * Endpoint: GET /api/map/kota?provinsiId=31 (optional filter)
     */
    @GetMapping(value = "/kota", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getKotaBoundaries(
            @RequestParam(required = false) String provinsiId,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double maxLat) {

        List<Kota> kotaList;

        if (minLng != null && minLat != null && maxLng != null && maxLat != null) {
            kotaList = kotaRepository.findByBoundingBox(minLng, minLat, maxLng, maxLat);
        } else if (provinsiId != null) {
            kotaList = kotaRepository.findByProvinsiWithGeometry(provinsiId);
        } else {
            kotaList = kotaRepository.findAllWithGeometry();
        }

        return buildFeatureCollection(
            kotaList.stream()
                .map(this::kotaToFeature)
                .collect(Collectors.toList())
        );
    }

    /**
     * Get district boundaries as GeoJSON FeatureCollection
     * Endpoint: GET /api/map/kecamatan?kotaId=3171 (optional filter)
     */
    @GetMapping(value = "/kecamatan", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getKecamatanBoundaries(
            @RequestParam(required = false) String kotaId,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double maxLat) {

        List<Kecamatan> kecamatanList;

        if (minLng != null && minLat != null && maxLng != null && maxLat != null) {
            kecamatanList = kecamatanRepository.findByBoundingBox(minLng, minLat, maxLng, maxLat);
        } else if (kotaId != null) {
            kecamatanList = kecamatanRepository.findByKotaWithGeometry(kotaId);
        } else {
            kecamatanList = kecamatanRepository.findAllWithGeometry();
        }

        return buildFeatureCollection(
            kecamatanList.stream()
                .map(this::kecamatanToFeature)
                .collect(Collectors.toList())
        );
    }

    /**
     * Get village boundaries as GeoJSON FeatureCollection
     * Endpoint: GET /api/map/kelurahan?kecamatanId=317101 (optional filter)
     */
    @GetMapping(value = "/kelurahan", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> getKelurahanBoundaries(
            @RequestParam(required = false) String kecamatanId,
            @RequestParam(required = false) Double minLng,
            @RequestParam(required = false) Double minLat,
            @RequestParam(required = false) Double maxLng,
            @RequestParam(required = false) Double maxLat) {

        List<Kelurahan> kelurahanList;

        if (minLng != null && minLat != null && maxLng != null && maxLat != null) {
            kelurahanList = kelurahanRepository.findByBoundingBox(minLng, minLat, maxLng, maxLat);
        } else if (kecamatanId != null) {
            kelurahanList = kelurahanRepository.findByKecamatanWithGeometry(kecamatanId);
        } else {
            kelurahanList = kelurahanRepository.findAllWithGeometry();
        }

        return buildFeatureCollection(
            kelurahanList.stream()
                .map(this::kelurahanToFeature)
                .collect(Collectors.toList())
        );
    }

    // === Helper Methods for GeoJSON Feature Construction ===

    /**
     * Convert JTS Geometry to GeoJSON Map structure manually
     * This bypasses Jackson serialization issues
     */
    private Map<String, Object> geometryToGeoJson(org.locationtech.jts.geom.Geometry geom) {
        if (geom == null) {
            return null;
        }

        Map<String, Object> geoJson = new HashMap<>();
        geoJson.put("type", geom.getGeometryType());

        if (geom instanceof org.locationtech.jts.geom.MultiPolygon mp) {
            List<List<List<List<Double>>>> coordinates = new ArrayList<>();

            for (int i = 0; i < mp.getNumGeometries(); i++) {
                org.locationtech.jts.geom.Polygon polygon = (org.locationtech.jts.geom.Polygon) mp.getGeometryN(i);
                List<List<List<Double>>> polygonCoords = new ArrayList<>();

                // Exterior ring
                polygonCoords.add(coordinatesToList(polygon.getExteriorRing().getCoordinates()));

                // Interior rings (holes)
                for (int j = 0; j < polygon.getNumInteriorRing(); j++) {
                    polygonCoords.add(coordinatesToList(polygon.getInteriorRingN(j).getCoordinates()));
                }

                coordinates.add(polygonCoords);
            }

            geoJson.put("coordinates", coordinates);
        }

        return geoJson;
    }

    /**
     * Convert JTS Coordinate array to List of [lon, lat] arrays
     */
    private List<List<Double>> coordinatesToList(org.locationtech.jts.geom.Coordinate[] coords) {
        List<List<Double>> result = new ArrayList<>();
        for (org.locationtech.jts.geom.Coordinate coord : coords) {
            result.add(Arrays.asList(coord.x, coord.y));
        }
        return result;
    }

    private Map<String, Object> provinsiToFeature(Provinsi provinsi) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");
        feature.put("geometry", geometryToGeoJson(provinsi.getGeom()));

        Map<String, Object> properties = new HashMap<>();
        properties.put("id", provinsi.getId());
        properties.put("kode", provinsi.getKode());
        properties.put("nama", provinsi.getNama());
        properties.put("level", "provinsi");
        feature.put("properties", properties);

        return feature;
    }

    private Map<String, Object> kotaToFeature(Kota kota) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");
        feature.put("geometry", geometryToGeoJson(kota.getGeom()));

        Map<String, Object> properties = new HashMap<>();
        properties.put("id", kota.getId());
        properties.put("kode", kota.getKode());
        properties.put("nama", kota.getNama());
        properties.put("provinsiId", kota.getProvinsi().getId());
        properties.put("provinsiNama", kota.getProvinsi().getNama());
        properties.put("level", "kota");
        feature.put("properties", properties);

        return feature;
    }

    private Map<String, Object> kecamatanToFeature(Kecamatan kecamatan) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");
        feature.put("geometry", geometryToGeoJson(kecamatan.getGeom()));

        Map<String, Object> properties = new HashMap<>();
        properties.put("id", kecamatan.getId());
        properties.put("kode", kecamatan.getKode());
        properties.put("nama", kecamatan.getNama());
        properties.put("kotaId", kecamatan.getKota().getId());
        properties.put("kotaNama", kecamatan.getKota().getNama());
        properties.put("level", "kecamatan");
        feature.put("properties", properties);

        return feature;
    }

    private Map<String, Object> kelurahanToFeature(Kelurahan kelurahan) {
        Map<String, Object> feature = new HashMap<>();
        feature.put("type", "Feature");
        feature.put("geometry", geometryToGeoJson(kelurahan.getGeom()));

        Map<String, Object> properties = new HashMap<>();
        properties.put("id", kelurahan.getId());
        properties.put("kode", kelurahan.getKode());
        properties.put("nama", kelurahan.getNama());
        properties.put("kecamatanId", kelurahan.getKecamatan().getId());
        properties.put("kecamatanNama", kelurahan.getKecamatan().getNama());
        properties.put("level", "kelurahan");
        feature.put("properties", properties);

        return feature;
    }

    private Map<String, Object> buildFeatureCollection(List<Map<String, Object>> features) {
        Map<String, Object> featureCollection = new HashMap<>();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.put("features", features);
        return featureCollection;
    }
}

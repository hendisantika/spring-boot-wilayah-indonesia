package com.hendisantika.repository;

import com.hendisantika.entity.Provinsi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * Project : spring-boot-wilayah-indonesia
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 06/04/22
 * Time: 07.13
 */
public interface ProvinsiRepository extends JpaRepository<Provinsi, String> {

    /**
     * Find all provinces with geometry data (for map rendering)
     */
    @Query("SELECT p FROM Provinsi p WHERE p.geom IS NOT NULL")
    List<Provinsi> findAllWithGeometry();

    /**
     * Find provinces within bounding box (for viewport filtering)
     *
     * @param minLng Minimum longitude (west)
     * @param minLat Minimum latitude (south)
     * @param maxLng Maximum longitude (east)
     * @param maxLat Maximum latitude (north)
     */
    @Query(nativeQuery = true, value = """
            SELECT * FROM provinsi
            WHERE geom IS NOT NULL
            AND ST_Intersects(geom, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))
            """)
    List<Provinsi> findByBoundingBox(
            @Param("minLng") double minLng,
            @Param("minLat") double minLat,
            @Param("maxLng") double maxLng,
            @Param("maxLat") double maxLat
    );
}

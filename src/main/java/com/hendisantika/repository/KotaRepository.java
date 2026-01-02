package com.hendisantika.repository;

import com.hendisantika.entity.Kota;
import com.hendisantika.entity.Provinsi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Created by IntelliJ IDEA.
 * Project : spring-boot-wilayah-indonesia
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 06/04/22
 * Time: 07.14
 */
public interface KotaRepository extends JpaRepository<Kota, String> {
    @Query(nativeQuery = true, value = "SELECT * from kota where id_provinsi=?1")
    List<Kota> findByProvinsi(String idProvinsi);

    Optional<Kota> findByKode(String kode);

    Iterable<Kota> findByProvinsi(Provinsi provinsi);

    /**
     * Find all kota/kabupaten with geometry data
     */
    @Query("SELECT k FROM Kota k WHERE k.geom IS NOT NULL")
    List<Kota> findAllWithGeometry();

    /**
     * Find kota/kabupaten with geometry for a specific province
     */
    @Query("SELECT k FROM Kota k WHERE k.provinsi.id = :provinsiId AND k.geom IS NOT NULL")
    List<Kota> findByProvinsiWithGeometry(@Param("provinsiId") String provinsiId);

    /**
     * Find kota/kabupaten within bounding box
     */
    @Query(nativeQuery = true, value = """
            SELECT * FROM kota
            WHERE geom IS NOT NULL
            AND ST_Intersects(geom, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))
            """)
    List<Kota> findByBoundingBox(
            @Param("minLng") double minLng,
            @Param("minLat") double minLat,
            @Param("maxLng") double maxLng,
            @Param("maxLat") double maxLat
    );
}

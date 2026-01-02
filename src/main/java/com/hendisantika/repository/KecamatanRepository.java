package com.hendisantika.repository;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kota;
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
 * Time: 07.14
 */
public interface KecamatanRepository extends JpaRepository<Kecamatan, String> {
    Iterable<Kecamatan> findByKota(Kota kota);

    @Query(nativeQuery = true, value = "SELECT * from kecamatan where id_kota=?1")
    List<Kecamatan> findByKota(String kota);

    /**
     * Find all kecamatan with geometry data
     */
    @Query("SELECT k FROM Kecamatan k WHERE k.geom IS NOT NULL")
    List<Kecamatan> findAllWithGeometry();

    /**
     * Find kecamatan with geometry for a specific kota
     */
    @Query("SELECT k FROM Kecamatan k WHERE k.kota.id = :kotaId AND k.geom IS NOT NULL")
    List<Kecamatan> findByKotaWithGeometry(@Param("kotaId") String kotaId);

    /**
     * Find kecamatan within bounding box
     */
    @Query(nativeQuery = true, value = """
            SELECT * FROM kecamatan
            WHERE geom IS NOT NULL
            AND ST_Intersects(geom, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))
            """)
    List<Kecamatan> findByBoundingBox(
            @Param("minLng") double minLng,
            @Param("minLat") double minLat,
            @Param("maxLng") double maxLng,
            @Param("maxLat") double maxLat
    );
}

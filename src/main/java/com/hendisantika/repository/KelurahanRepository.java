package com.hendisantika.repository;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kelurahan;
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
 * Time: 07.15
 */
public interface KelurahanRepository extends JpaRepository<Kelurahan, String> {
    Iterable<Kelurahan> findByKecamatan(Kecamatan kecamatan);

    @Query(nativeQuery = true, value = "SELECT * from kelurahan where id_kecamatan=?1")
    List<Kelurahan> findByKecamatan(String kecamatan);

    /**
     * Find all kelurahan with geometry data
     */
    @Query("SELECT k FROM Kelurahan k WHERE k.geom IS NOT NULL")
    List<Kelurahan> findAllWithGeometry();

    /**
     * Find kelurahan with geometry for a specific kecamatan
     */
    @Query("SELECT k FROM Kelurahan k WHERE k.kecamatan.id = :kecamatanId AND k.geom IS NOT NULL")
    List<Kelurahan> findByKecamatanWithGeometry(@Param("kecamatanId") String kecamatanId);

    /**
     * Find kelurahan within bounding box
     */
    @Query(nativeQuery = true, value = """
            SELECT * FROM kelurahan
            WHERE geom IS NOT NULL
            AND ST_Intersects(geom, ST_MakeEnvelope(:minLng, :minLat, :maxLng, :maxLat, 4326))
            """)
    List<Kelurahan> findByBoundingBox(
            @Param("minLng") double minLng,
            @Param("minLat") double minLat,
            @Param("maxLng") double maxLng,
            @Param("maxLat") double maxLat
    );
}

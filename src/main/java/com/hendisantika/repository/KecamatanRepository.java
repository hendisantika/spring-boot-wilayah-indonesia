package com.hendisantika.repository;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}

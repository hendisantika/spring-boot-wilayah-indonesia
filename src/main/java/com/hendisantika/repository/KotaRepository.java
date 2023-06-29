package com.hendisantika.repository;

import com.hendisantika.entity.Kota;
import com.hendisantika.entity.Provinsi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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
}

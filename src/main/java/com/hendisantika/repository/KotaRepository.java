package com.hendisantika.repository;

import com.hendisantika.entity.Kota;
import com.hendisantika.entity.Provinsi;
import org.springframework.data.jpa.repository.JpaRepository;

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
//    Kota findByProvinsi(String idProvinsi);

    Optional<Kota> findByKode(String kode);

    Iterable<Kota> findByProvinsi(Provinsi provinsi);
}

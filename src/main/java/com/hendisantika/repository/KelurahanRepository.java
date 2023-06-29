package com.hendisantika.repository;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kelurahan;
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
 * Time: 07.15
 */
public interface KelurahanRepository extends JpaRepository<Kelurahan, String> {
    Iterable<Kelurahan> findByKecamatan(Kecamatan kecamatan);

    @Query(nativeQuery = true, value = "SELECT * from kelurahan where id_kecamatan=?1")
    List<Kelurahan> findByKecamatan(String kecamatan);
}

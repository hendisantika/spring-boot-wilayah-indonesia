package com.hendisantika.repository;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kelurahan;
import org.springframework.data.jpa.repository.JpaRepository;

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
    Iterable<Kecamatan> findByKecamatan(Kecamatan kecamatan);
}

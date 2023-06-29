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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * Project : spring-boot-wilayah-indonesia
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 6/29/23
 * Time: 11:49
 * To change this template use File | Settings | File Templates.
 */
@RestController
@RequiredArgsConstructor
public class RegionController {
    private final ProvinsiRepository provinsiRepository;
    private final KotaRepository kotaRepository;
    private final KecamatanRepository kecamatanRepository;
    private final KelurahanRepository kelurahanRepository;

    @GetMapping("/provinsi")
    public List<Provinsi> getProvinces() {
        return provinsiRepository.findAll();
    }

    @GetMapping("/kota")
    public List<Kota> getRegencies(@RequestParam("province") String province) {
        return kotaRepository.findByProvinsi(province);
    }

    @GetMapping("/kecamatan")
    public List<Kecamatan> getDistricts(@RequestParam("kota") String kota) {
        return kecamatanRepository.findByKota(kota);
    }

    @GetMapping("/kelurahan")
    public List<Kelurahan> getVillages(@RequestParam("kecamatan") String kecamatan) {
        return kelurahanRepository.findByKecamatan(kecamatan);
    }
}

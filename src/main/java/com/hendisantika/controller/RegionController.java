package com.hendisantika.controller;

import com.hendisantika.entity.Provinsi;
import com.hendisantika.repository.ProvinsiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
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

    @GetMapping("/provinsi")
    public List<Provinsi> getProvinces() {
        return provinsiRepository.findAll();
    }
}

package com.hendisantika.controller;

import com.hendisantika.repository.ProvinsiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

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
}

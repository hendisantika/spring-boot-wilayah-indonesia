package com.hendisantika.controller;

import com.hendisantika.entity.Provinsi;
import com.hendisantika.repository.ProvinsiRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * Project : spring-boot-wilayah-indonesia
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 06/04/22
 * Time: 07.16
 */
@Controller
@RequiredArgsConstructor
public class IndexController {
    private final ProvinsiRepository provinsiRepository;

    public String index(Model model) {
        List<Provinsi> provinsiList = provinsiRepository.findAll();
        model.addAttribute("provinsiList", provinsiList);
        return "index";
    }
}

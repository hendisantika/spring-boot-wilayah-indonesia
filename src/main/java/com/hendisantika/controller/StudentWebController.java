package com.hendisantika.controller;

import com.hendisantika.entity.*;
import com.hendisantika.repository.KecamatanRepository;
import com.hendisantika.repository.KelurahanRepository;
import com.hendisantika.repository.KotaRepository;
import com.hendisantika.repository.ProvinsiRepository;
import com.hendisantika.service.StudentService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;

/**
 * Created by IntelliJ IDEA.
 * Project : student-crud-app
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 23/03/22
 * Time: 10.15
 */
@Controller
@AllArgsConstructor
public class StudentWebController {
    private StudentService studentService;

    private ProvinsiRepository provinsiRepository;

    private KotaRepository kotaRepository;

    private KecamatanRepository kecamatanRepository;

    private KelurahanRepository kelurahanRepository;

    @ModelAttribute("provinsiList")
    public Iterable<Provinsi> provinsiList() {
        return provinsiRepository.findAll();
    }

    @GetMapping("/create")
    public ModelMap displayInfoForm(Model model,
                                    @RequestParam(value = "provinsi", required = false) Provinsi provinsi,
                                    @RequestParam(value = "kota", required = false) Kota kota,
                                    @RequestParam(value = "kecamatan", required = false) Kecamatan kecamatan,
                                    @RequestParam(value = "kelurahan", required = false) Kelurahan kelurahan) {

        ModelMap mm = new ModelMap();
        if (provinsi != null) {
            mm.addAttribute(provinsi);
            mm.addAttribute(kotaRepository.findByProvinsi(provinsi));
        }
        System.out.println("provinsi = " + provinsi);
        if (kota != null) {
            mm.addAttribute(kota);
            mm.addAttribute(kecamatanRepository.findByKota(kota));
        }
        if (kecamatan != null) {
            mm.addAttribute(kecamatan);
            mm.addAttribute(kelurahanRepository.findByKecamatan(kecamatan));
        }
        if (kelurahan != null) {
            mm.addAttribute(kelurahan);
        }
        model.addAttribute("student", new Student());
        return mm;
    }

    @PostMapping("/info/form")
    public String process() {
        return "redirect:info/view";
    }

    @GetMapping("/info/view")
    public void info() {

    }

    @GetMapping("/form")
    public String form() {
        return "form";
    }


    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("student", studentService.getAllStudents());
        return "index";
    }

    @GetMapping(value = "/create2")
    public String create1(Model model) {
        model.addAttribute("student", new Student());
        return "formStudent";
    }

    @PostMapping(value = "/create")
    public String tambahStudent(Model model, Student student) {
        model.addAttribute("student", studentService.save(student));
        return "redirect:/";
    }

    @GetMapping(value = "/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        model.addAttribute("student", studentService.findById(id));
        return "formStudent";
    }

    @GetMapping(value = "/hapus/{id}")
    public String hapusStudent(@PathVariable Long id) {
        studentService.deleteById(id);
        return "redirect:/";
    }

    @GetMapping("/add")
    public ModelMap displayStudentForm(Model model) {
        ModelMap mm = new ModelMap();
        model.addAttribute("provinsiList", provinsiList());
        model.addAttribute("student", new Student());
        return mm;
    }
}

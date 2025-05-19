package com.hendisantika.controller;

import com.hendisantika.entity.Kecamatan;
import com.hendisantika.entity.Kelurahan;
import com.hendisantika.entity.Kota;
import com.hendisantika.entity.Provinsi;
import com.hendisantika.entity.Student;
import com.hendisantika.repository.KecamatanRepository;
import com.hendisantika.repository.KelurahanRepository;
import com.hendisantika.repository.KotaRepository;
import com.hendisantika.repository.ProvinsiRepository;
import com.hendisantika.service.StudentService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Created by IntelliJ IDEA.
 * Project : student-crud-app
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 23/03/22
 * Time: 10.15
 */
@Slf4j
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
    public String displayInfoForm(Model model,
                                  @RequestParam(value = "provinsi", required = false) Provinsi provinsi,
                                  @RequestParam(value = "kota", required = false) Kota kota,
                                  @RequestParam(value = "kecamatan", required = false) Kecamatan kecamatan,
                                  @RequestParam(value = "kelurahan", required = false) Kelurahan kelurahan) {

        // Create a new student
        Student student = new Student();
        if (kelurahan != null) {
            student.setKelurahan(kelurahan);
        }
        model.addAttribute("student", student);

        // Always load the list of provinces
        model.addAttribute("provinsiList", provinsiList());

        // Load the appropriate lists based on the selected administrative divisions
        if (provinsi != null) {
            model.addAttribute("provinsi", provinsi);
            model.addAttribute("kotaList", kotaRepository.findByProvinsi(provinsi));

            if (kota != null) {
                model.addAttribute("kota", kota);
                model.addAttribute("kecamatanList", kecamatanRepository.findByKota(kota));

                if (kecamatan != null) {
                    model.addAttribute("kecamatan", kecamatan);
                    model.addAttribute("kelurahanList", kelurahanRepository.findByKecamatan(kecamatan));
                    log.info("kelurahanList: {}", kelurahanRepository.findByKecamatan(kecamatan));

                    if (kelurahan != null) {
                        model.addAttribute("kelurahan", kelurahan);
                    }
                }
            }
        }

        return "formStudent";
    }

    @PostMapping("/info/form")
    public String process() {
        return "redirect:info/view";
    }

    @GetMapping("/info/view")
    public String info(Model model) {
        // Load all students
        model.addAttribute("student", studentService.getAllStudents());
        return "info/view";
    }

    @GetMapping("/form")
    public String form(Model model) {
        // Create a new student
        model.addAttribute("student", new Student());

        // Load the list of provinces
        model.addAttribute("provinsiList", provinsiList());

        return "formStudent";
    }


    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("student", studentService.getAllStudents());
        return "index";
    }

    @GetMapping(value = "/create2")
    public String create1(Model model) {
        // Create a new student
        model.addAttribute("student", new Student());

        // Load the list of provinces
        model.addAttribute("provinsiList", provinsiList());

        return "formStudent";
    }

    @PostMapping(value = "/create")
    public String tambahStudent(Model model, Student student) {
        // If student has an ID, it's an update operation
        if (student.getId() != null) {
            // Get the existing student to preserve any fields not in the form
            Student existingStudent = studentService.findById(student.getId())
                    .orElseThrow(() -> new RuntimeException("Student not found with id: " + student.getId()));

            // Update the fields from the form
            existingStudent.setFirstName(student.getFirstName());
            existingStudent.setLastName(student.getLastName());
            existingStudent.setBirthDate(student.getBirthDate());
            existingStudent.setEmail(student.getEmail());
            existingStudent.setPhone(student.getPhone());
            existingStudent.setJurusan(student.getJurusan());
            existingStudent.setKelurahan(student.getKelurahan());

            // Save the updated student
            model.addAttribute("student", studentService.save(existingStudent));
        } else {
            // It's a new student, save it directly
            model.addAttribute("student", studentService.save(student));
        }
        return "redirect:/";
    }

    @GetMapping(value = "/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        Student student = studentService.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));

        model.addAttribute("student", student);

        // Load administrative divisions for the student
        if (student.getKelurahan() != null) {
            Kelurahan kelurahan = student.getKelurahan();
            model.addAttribute("kelurahan", kelurahan);

            Kecamatan kecamatan = kelurahan.getKecamatan();
            model.addAttribute("kecamatan", kecamatan);
            model.addAttribute("kelurahanList", kelurahanRepository.findByKecamatan(kecamatan));

            Kota kota = kecamatan.getKota();
            model.addAttribute("kota", kota);
            model.addAttribute("kecamatanList", kecamatanRepository.findByKota(kota));

            Provinsi provinsi = kota.getProvinsi();
            model.addAttribute("provinsi", provinsi);
            model.addAttribute("kotaList", kotaRepository.findByProvinsi(provinsi));
        }

        // Always load the list of provinces
        model.addAttribute("provinsiList", provinsiList());

        return "formStudent";
    }

    @GetMapping(value = "/hapus/{id}")
    public String hapusStudent(@PathVariable Long id) {
        studentService.deleteById(id);
        return "redirect:/";
    }

    @GetMapping("/add")
    public String displayStudentForm(Model model) {
        // Create a new student
        model.addAttribute("student", new Student());

        // Load the list of provinces
        model.addAttribute("provinsiList", provinsiList());

        return "formStudent";
    }
}

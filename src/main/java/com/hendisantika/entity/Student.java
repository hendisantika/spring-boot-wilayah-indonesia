package com.hendisantika.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * Created by IntelliJ IDEA.
 * Project : student-crud-app
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 15/03/22
 * Time: 06.15
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "student_id_seq")
    @SequenceGenerator(name = "student_id_seq", sequenceName = "student_id_seq")
    private Long id;

    @NotEmpty(message = "First name is required")
    @NotNull(message = "FirstName can not be null!!")
    @Column(nullable = false, name = "first_Name")
    private String firstName;

    @NotEmpty(message = "Last name is required")
    @NotNull(message = "LastName can not be null!!")
    @Column(nullable = false, name = "last_name")
    private String lastName;

    @NotNull(message = "Please enter birth date")
    @Past(message = "Birth date should be less than current date!!")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate birthDate;

    @NotEmpty(message = "email is required")
    @Email
    @Column(nullable = false, name = "email", unique = true)
    private String email;

    @NotEmpty(message = "Phone number is required")
    @NotNull(message = "Phone can not be null!!")
    @Size(max = 13, min = 10, message = "Mobile number should be of 10 digits")
    @Column(nullable = false, unique = true)
    private String phone;

    @NotEmpty(message = "Jurusan is required")
    @Column(nullable = false, unique = true)
    private String jurusan;

    @OneToOne(
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL)
    @JoinColumn(name = "provinsi_id", referencedColumnName = "id")
    private Provinsi provinsi;

    @OneToOne(
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL)
    @JoinColumn(name = "kota_id", referencedColumnName = "id")
    private Kota kota;

    @OneToOne(
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL)
    @JoinColumn(name = "kecamatan_id", referencedColumnName = "id")
    private Kecamatan kecamatan;

    @OneToOne(
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL)
    @JoinColumn(name = "kelurahan_id", referencedColumnName = "id")
    private Kelurahan kelurahan;

}

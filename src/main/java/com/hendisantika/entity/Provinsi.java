package com.hendisantika.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "provinsi")
@Data
public class Provinsi {
    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "kode", nullable = false, length = 50)
    private String kode;

    @Column(name = "nama", nullable = false)
    private String nama;
}

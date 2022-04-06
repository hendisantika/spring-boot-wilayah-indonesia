package com.hendisantika.entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

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

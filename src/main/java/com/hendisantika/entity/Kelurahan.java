package com.hendisantika.entity;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "kelurahan")
@Data
public class Kelurahan {
    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_kecamatan")
    private Kecamatan kecamatan;

    @Column(name = "kode", nullable = false, length = 50)
    private String kode;

    @Column(name = "nama", nullable = false)
    private String nama;

}

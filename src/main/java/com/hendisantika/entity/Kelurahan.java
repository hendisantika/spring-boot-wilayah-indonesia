package com.hendisantika.entity;

import jakarta.persistence.*;
import lombok.Data;

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

    @OneToOne(mappedBy = "kelurahan")
    private Student user;
}


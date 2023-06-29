package com.hendisantika.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "kecamatan")
@Data
public class Kecamatan {
    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_kota")
    private Kota kota;

    @Column(name = "kode", nullable = false, length = 50)
    private String kode;

    @Column(name = "nama", nullable = false)
    private String nama;

    @OneToMany(mappedBy = "kecamatan")
    private Set<Kelurahan> kelurahans = new LinkedHashSet<>();

    @OneToOne(mappedBy = "kecamatan")
    private Student user;

}

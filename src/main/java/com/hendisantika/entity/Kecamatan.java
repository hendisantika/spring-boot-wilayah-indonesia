package com.hendisantika.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "kecamatan")
@Data
public class Kecamatan {
    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL, optional = false)
    @JoinColumn(
            name = "id_kota",
            referencedColumnName = "kode",
            foreignKey = @ForeignKey(name = "kota_kd_fk"),
            nullable = false)
    @JsonDeserialize(as = Kota.class)
    @JsonSerialize(as = Kota.class)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Kota kota;

    @Column(name = "kode", nullable = false, length = 50)
    private String kode;

    @Column(name = "nama", nullable = false)
    private String nama;
}

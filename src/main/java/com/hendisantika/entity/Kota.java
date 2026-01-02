package com.hendisantika.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hendisantika.config.GeometryDeserializer;
import com.hendisantika.config.GeometrySerializer;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.MultiPolygon;

@Entity
@Table(name = "kota")
@Data
public class Kota {
    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id_provinsi",
            referencedColumnName = "kode",
            foreignKey = @ForeignKey(name = "provinsi_kd_fk"),
            nullable = false)
    @JsonDeserialize(as = Provinsi.class)
    @JsonSerialize(as = Provinsi.class)
    @JdbcTypeCode(SqlTypes.JSON)
    private Provinsi provinsi;

    @Column(name = "kode", nullable = false, length = 50)
    private String kode;

    @Column(name = "nama", nullable = false)
    private String nama;

    @Column(name = "geom", columnDefinition = "geometry(MultiPolygon, 4326)")
    @JsonIgnore  // Exclude from JSON serialization - use MapController for GeoJSON output
    @JsonSerialize(using = GeometrySerializer.class)
    @JsonDeserialize(using = GeometryDeserializer.class)
    private MultiPolygon geom;
}

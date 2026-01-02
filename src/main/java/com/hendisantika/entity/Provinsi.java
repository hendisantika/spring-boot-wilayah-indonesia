package com.hendisantika.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.hendisantika.config.GeometryDeserializer;
import com.hendisantika.config.GeometrySerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.locationtech.jts.geom.MultiPolygon;

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

    @Column(name = "geom", columnDefinition = "geometry(MultiPolygon, 4326)")
    @JsonIgnore  // Exclude from JSON serialization - use MapController for GeoJSON output
    @JsonSerialize(using = GeometrySerializer.class)
    @JsonDeserialize(using = GeometryDeserializer.class)
    private MultiPolygon geom;
}

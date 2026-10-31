package com.hendisantika.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryCollection;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.MultiLineString;
import org.locationtech.jts.geom.MultiPoint;
import org.locationtech.jts.geom.MultiPolygon;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.JacksonModule;
import tools.jackson.databind.annotation.JsonSerialize;
import tools.jackson.databind.module.SimpleModule;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * Project : spring-boot-wilayah-indonesia
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 1/02/26
 * Time: 18:49
 * To change this template use File | Settings | File Templates.
 */

/**
 * Jackson 3 configuration for GeoJSON serialization.
 * <p>
 * Spring Boot 4 automatically registers every {@link JacksonModule} bean on its
 * auto-configured {@code JsonMapper}, so we only contribute the geometry module
 * instead of replacing the whole mapper.
 */
@Configuration
public class JacksonConfig {

    private static final List<Class<? extends Geometry>> GEOMETRY_TYPES = List.of(
            Geometry.class, Point.class, LineString.class, Polygon.class,
            MultiPoint.class, MultiLineString.class, MultiPolygon.class, GeometryCollection.class);

    @Bean
    public JacksonModule geometryModule() {
        SimpleModule geometryModule = new SimpleModule("GeometryModule");

        GeometrySerializer serializer = new GeometrySerializer();
        for (Class<? extends Geometry> type : GEOMETRY_TYPES) {
            geometryModule.addSerializer(type, serializer);
            // Prevent Jackson from introspecting Geometry bean properties
            geometryModule.setMixInAnnotation(type, GeometryMixin.class);
        }

        geometryModule.addDeserializer(Geometry.class, new GeometryDeserializer());
        return geometryModule;
    }

    /**
     * Mix-in to prevent Jackson from introspecting Geometry properties
     */
    @JsonSerialize(using = GeometrySerializer.class)
    @JsonIgnoreProperties({"envelope", "factory", "userData", "precisionModel", "numPoints",
            "coordinates", "coordinate", "geometryType", "boundary", "centroid",
            "interiorPoint", "class", "empty", "valid", "simple", "rectangle"})
    private interface GeometryMixin {
    }
}

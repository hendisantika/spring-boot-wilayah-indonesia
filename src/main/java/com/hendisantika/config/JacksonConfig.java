package com.hendisantika.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.locationtech.jts.geom.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
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
 * Jackson configuration for GeoJSON serialization
 */
@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Disable default typing to prevent introspection issues
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        mapper.disable(MapperFeature.DEFAULT_VIEW_INCLUSION);
        mapper.disable(MapperFeature.AUTO_DETECT_GETTERS);
        mapper.disable(MapperFeature.AUTO_DETECT_IS_GETTERS);

        // Create geometry module with custom serializers
        SimpleModule geometryModule = new SimpleModule("GeometryModule");

        // Register serializers for all geometry types
        geometryModule.addSerializer(Geometry.class, new GeometrySerializer());
        geometryModule.addSerializer(Point.class, new GeometrySerializer());
        geometryModule.addSerializer(LineString.class, new GeometrySerializer());
        geometryModule.addSerializer(Polygon.class, new GeometrySerializer());
        geometryModule.addSerializer(MultiPoint.class, new GeometrySerializer());
        geometryModule.addSerializer(MultiLineString.class, new GeometrySerializer());
        geometryModule.addSerializer(MultiPolygon.class, new GeometrySerializer());
        geometryModule.addSerializer(GeometryCollection.class, new GeometrySerializer());

        // Register deserializer
        geometryModule.addDeserializer(Geometry.class, new GeometryDeserializer());

        mapper.registerModule(geometryModule);

        // Add mix-ins to ignore Geometry bean properties
        mapper.addMixIn(Geometry.class, GeometryMixin.class);
        mapper.addMixIn(Point.class, GeometryMixin.class);
        mapper.addMixIn(LineString.class, GeometryMixin.class);
        mapper.addMixIn(Polygon.class, GeometryMixin.class);
        mapper.addMixIn(MultiPoint.class, GeometryMixin.class);
        mapper.addMixIn(MultiLineString.class, GeometryMixin.class);
        mapper.addMixIn(MultiPolygon.class, GeometryMixin.class);
        mapper.addMixIn(GeometryCollection.class, GeometryMixin.class);

        return mapper;
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

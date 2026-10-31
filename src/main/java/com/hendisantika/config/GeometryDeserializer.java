package com.hendisantika.config;

import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.ValueDeserializer;
import tools.jackson.databind.exc.InvalidFormatException;
import tools.jackson.databind.JsonNode;
import org.locationtech.jts.geom.*;

import java.util.ArrayList;
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
 * Converts GeoJSON format to JTS Geometry objects for database persistence
 */
public class GeometryDeserializer extends ValueDeserializer<Geometry> {

    private static final GeometryFactory geometryFactory = new GeometryFactory();

    @Override
    public Geometry deserialize(JsonParser p, DeserializationContext ctxt) {
        JsonNode node = ctxt.readTree(p);
        String type = node.get("type").asString();
        JsonNode coordinates = node.get("coordinates");

        return switch (type) {
            case "Point" -> parsePoint(coordinates);
            case "LineString" -> parseLineString(coordinates);
            case "Polygon" -> parsePolygon(coordinates);
            case "MultiPoint" -> parseMultiPoint(coordinates);
            case "MultiLineString" -> parseMultiLineString(coordinates);
            case "MultiPolygon" -> parseMultiPolygon(coordinates);
            default -> throw InvalidFormatException.from(p, "Unsupported geometry type: " + type, type, Geometry.class);
        };
    }

    private Point parsePoint(JsonNode coordinates) {
        double x = coordinates.get(0).asDouble();
        double y = coordinates.get(1).asDouble();
        return geometryFactory.createPoint(new Coordinate(x, y));
    }

    private LineString parseLineString(JsonNode coordinates) {
        Coordinate[] coords = parseCoordinateArray(coordinates);
        return geometryFactory.createLineString(coords);
    }

    private Polygon parsePolygon(JsonNode coordinates) {
        LinearRing shell = geometryFactory.createLinearRing(parseCoordinateArray(coordinates.get(0)));
        LinearRing[] holes = new LinearRing[coordinates.size() - 1];
        for (int i = 1; i < coordinates.size(); i++) {
            holes[i - 1] = geometryFactory.createLinearRing(parseCoordinateArray(coordinates.get(i)));
        }
        return geometryFactory.createPolygon(shell, holes);
    }

    private MultiPoint parseMultiPoint(JsonNode coordinates) {
        Point[] points = new Point[coordinates.size()];
        for (int i = 0; i < coordinates.size(); i++) {
            points[i] = parsePoint(coordinates.get(i));
        }
        return geometryFactory.createMultiPoint(points);
    }

    private MultiLineString parseMultiLineString(JsonNode coordinates) {
        LineString[] lineStrings = new LineString[coordinates.size()];
        for (int i = 0; i < coordinates.size(); i++) {
            lineStrings[i] = parseLineString(coordinates.get(i));
        }
        return geometryFactory.createMultiLineString(lineStrings);
    }

    private MultiPolygon parseMultiPolygon(JsonNode coordinates) {
        Polygon[] polygons = new Polygon[coordinates.size()];
        for (int i = 0; i < coordinates.size(); i++) {
            polygons[i] = parsePolygon(coordinates.get(i));
        }
        return geometryFactory.createMultiPolygon(polygons);
    }

    private Coordinate[] parseCoordinateArray(JsonNode coordinates) {
        List<Coordinate> coords = new ArrayList<>();
        for (JsonNode coord : coordinates) {
            double x = coord.get(0).asDouble();
            double y = coord.get(1).asDouble();
            coords.add(new Coordinate(x, y));
        }
        return coords.toArray(new Coordinate[0]);
    }
}

package com.hendisantika.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import org.locationtech.jts.geom.*;

import java.io.IOException;
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
 * Converts JTS Geometry objects to GeoJSON format for REST API responses
 */
public class GeometrySerializer extends JsonSerializer<Geometry> {

    @Override
    public void serialize(Geometry value, JsonGenerator gen, SerializerProvider serializers)
            throws IOException {
        if (value == null) {
            gen.writeNull();
            return;
        }

        gen.writeStartObject();
        gen.writeStringField("type", value.getGeometryType());

        if (value instanceof Point) {
            writePointCoordinates(gen, (Point) value);
        } else if (value instanceof LineString) {
            writeLineStringCoordinates(gen, (LineString) value);
        } else if (value instanceof Polygon) {
            writePolygonCoordinates(gen, (Polygon) value);
        } else if (value instanceof MultiPoint) {
            writeMultiPointCoordinates(gen, (MultiPoint) value);
        } else if (value instanceof MultiLineString) {
            writeMultiLineStringCoordinates(gen, (MultiLineString) value);
        } else if (value instanceof MultiPolygon) {
            writeMultiPolygonCoordinates(gen, (MultiPolygon) value);
        }

        gen.writeEndObject();
    }

    private void writePointCoordinates(JsonGenerator gen, Point point) throws IOException {
        gen.writeFieldName("coordinates");
        gen.writeStartArray();
        gen.writeNumber(point.getX());
        gen.writeNumber(point.getY());
        gen.writeEndArray();
    }

    private void writeLineStringCoordinates(JsonGenerator gen, LineString lineString) throws IOException {
        gen.writeFieldName("coordinates");
        gen.writeStartArray();
        for (Coordinate coord : lineString.getCoordinates()) {
            gen.writeStartArray();
            gen.writeNumber(coord.x);
            gen.writeNumber(coord.y);
            gen.writeEndArray();
        }
        gen.writeEndArray();
    }

    private void writePolygonCoordinates(JsonGenerator gen, Polygon polygon) throws IOException {
        gen.writeFieldName("coordinates");
        gen.writeStartArray();

        // Exterior ring
        writeLinearRing(gen, polygon.getExteriorRing());

        // Interior rings (holes)
        for (int i = 0; i < polygon.getNumInteriorRing(); i++) {
            writeLinearRing(gen, polygon.getInteriorRingN(i));
        }

        gen.writeEndArray();
    }

    private void writeMultiPointCoordinates(JsonGenerator gen, MultiPoint multiPoint) throws IOException {
        gen.writeFieldName("coordinates");
        gen.writeStartArray();
        for (int i = 0; i < multiPoint.getNumGeometries(); i++) {
            Point point = (Point) multiPoint.getGeometryN(i);
            gen.writeStartArray();
            gen.writeNumber(point.getX());
            gen.writeNumber(point.getY());
            gen.writeEndArray();
        }
        gen.writeEndArray();
    }

    private void writeMultiLineStringCoordinates(JsonGenerator gen, MultiLineString multiLineString) throws IOException {
        gen.writeFieldName("coordinates");
        gen.writeStartArray();
        for (int i = 0; i < multiLineString.getNumGeometries(); i++) {
            LineString lineString = (LineString) multiLineString.getGeometryN(i);
            gen.writeStartArray();
            for (Coordinate coord : lineString.getCoordinates()) {
                gen.writeStartArray();
                gen.writeNumber(coord.x);
                gen.writeNumber(coord.y);
                gen.writeEndArray();
            }
            gen.writeEndArray();
        }
        gen.writeEndArray();
    }

    private void writeMultiPolygonCoordinates(JsonGenerator gen, MultiPolygon multiPolygon) throws IOException {
        gen.writeFieldName("coordinates");
        gen.writeStartArray();
        for (int i = 0; i < multiPolygon.getNumGeometries(); i++) {
            Polygon polygon = (Polygon) multiPolygon.getGeometryN(i);
            gen.writeStartArray();

            // Exterior ring
            writeLinearRing(gen, polygon.getExteriorRing());

            // Interior rings (holes)
            for (int j = 0; j < polygon.getNumInteriorRing(); j++) {
                writeLinearRing(gen, polygon.getInteriorRingN(j));
            }

            gen.writeEndArray();
        }
        gen.writeEndArray();
    }

    private void writeLinearRing(JsonGenerator gen, LineString ring) throws IOException {
        gen.writeStartArray();
        for (Coordinate coord : ring.getCoordinates()) {
            gen.writeStartArray();
            gen.writeNumber(coord.x);
            gen.writeNumber(coord.y);
            gen.writeEndArray();
        }
        gen.writeEndArray();
    }
}

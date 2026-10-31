package com.hendisantika;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.web.client.RestClient;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import tools.jackson.databind.JsonNode;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Full integration test backed by a throwaway PostGIS container.
 * Flyway applies all migrations, then Hibernate validates the schema.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SpringBootWilayahIndonesiaApplicationTests {

    private static final DockerImageName POSTGIS_IMAGE = DockerImageName.parse("postgis/postgis:16-3.4")
            .asCompatibleSubstituteFor("postgres");

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgis = new PostgreSQLContainer(POSTGIS_IMAGE);

    @LocalServerPort
    int port;

    @Test
    void contextLoads() {
        // Verifies the application context starts, migrations run and the JPA schema validates
    }

    @Test
    void provinsiEndpointReturnsSerializedProvinces() {
        JsonNode body = RestClient.create("http://localhost:" + port)
                .get().uri("/provinsi")
                .retrieve()
                .body(JsonNode.class);

        assertThat(body).isNotNull();
        assertThat(body.isArray()).isTrue();
        assertThat(body.size()).isGreaterThanOrEqualTo(34);
        JsonNode first = body.get(0);
        assertThat(first.hasNonNull("kode")).isTrue();
        assertThat(first.hasNonNull("nama")).isTrue();
        assertThat(first.has("geom")).isFalse();
    }
}

package com.hendisantika;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5434/wilayah_indonesia",
        "spring.datasource.username=yu71",
        "spring.datasource.password=53cret",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=false"
})
class SpringBootWilayahIndonesiaApplicationTests {

    @Test
    void contextLoads() {
        // Verify that the application context loads successfully
        // This test uses the existing Docker Compose database
    }

}

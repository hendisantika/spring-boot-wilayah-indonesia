package com.hendisantika.repository;

import com.hendisantika.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Created by IntelliJ IDEA.
 * Project : student-crud-app
 * User: hendisantika
 * Email: hendisantika@gmail.com
 * Telegram : @hendisantika34
 * Date: 15/03/22
 * Time: 06.21
 */
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Query method
    Optional<Student> findByEmail(String email);
}

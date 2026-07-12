package com.dormitory.management.modules.contract.repository;

import com.dormitory.management.modules.contract.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {

    @Query("SELECT s FROM Student s WHERE s.account.accountId = :accountId")
    Optional<Student> findByAccountId(@Param("accountId") Integer accountId);

    boolean existsByStudentCode(String studentCode);
}

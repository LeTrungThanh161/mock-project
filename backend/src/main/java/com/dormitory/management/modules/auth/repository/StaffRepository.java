package com.dormitory.management.modules.auth.repository;

import com.dormitory.management.modules.auth.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer> {

    @Query("SELECT s FROM Staff s WHERE s.account.accountId = :accountId")
    Optional<Staff> findByAccountId(@Param("accountId") Integer accountId);
}

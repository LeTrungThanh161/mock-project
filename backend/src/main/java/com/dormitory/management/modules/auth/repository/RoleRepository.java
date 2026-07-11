package com.dormitory.management.modules.auth.repository;

import com.dormitory.management.modules.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Byte> {
    Optional<Role> findByRoleName(String roleName);
}

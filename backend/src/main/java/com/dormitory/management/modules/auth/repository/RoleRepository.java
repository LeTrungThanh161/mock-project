package com.dormitory.management.modules.auth.repository;

import com.dormitory.management.modules.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface RoleRepository extends JpaRepository<Role, Byte> {
    Optional<Role> findByRoleName(String roleName);
}

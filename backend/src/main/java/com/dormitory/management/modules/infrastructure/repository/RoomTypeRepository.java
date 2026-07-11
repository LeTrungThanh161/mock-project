package com.dormitory.management.modules.infrastructure.repository;

import com.dormitory.management.modules.infrastructure.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    Optional<RoomType> findByTypeName(String typeName);
    boolean existsByTypeName(String typeName);
}

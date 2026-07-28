package com.dormitory.management.constants;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class RoomStatusConverter implements AttributeConverter<RoomStatus, String> {

    @Override
    public String convertToDatabaseColumn(RoomStatus status) {
        if (status == null) {
            return null;
        }
        return status.name();
    }

    @Override
    public RoomStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        for (RoomStatus status : RoomStatus.values()) {
            if (status.name().equalsIgnoreCase(dbData)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status: " + dbData);
    }
}

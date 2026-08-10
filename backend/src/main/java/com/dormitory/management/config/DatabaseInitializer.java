package com.dormitory.management.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            log.info("Checking and updating CK_Ticket_Status constraint in SQL Server database...");
            try {
                jdbcTemplate.execute("EXEC dbo.sp_SetSecurityContext @Role = N'Admin'");
            } catch (Exception ignored) {}

            jdbcTemplate.execute("""
                IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_Ticket_Status')
                BEGIN
                    ALTER TABLE dbo.IssueTicket DROP CONSTRAINT CK_Ticket_Status;
                END
                ALTER TABLE dbo.IssueTicket ADD CONSTRAINT CK_Ticket_Status CHECK (Status IN ('Pending', 'InProgress', 'Completed', 'Rejected'));
            """);

            jdbcTemplate.execute("""
                IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TicketHistory_OldStatus')
                BEGIN
                    ALTER TABLE dbo.IssueTicketHistory DROP CONSTRAINT CK_TicketHistory_OldStatus;
                END
                IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_TicketHistory_NewStatus')
                BEGIN
                    ALTER TABLE dbo.IssueTicketHistory DROP CONSTRAINT CK_TicketHistory_NewStatus;
                END
            """);

            log.info("Successfully updated database constraints for TicketStatus.");
        } catch (Exception e) {
            log.warn("Could not automatically update DB constraints: {}", e.getMessage());
        }
    }
}

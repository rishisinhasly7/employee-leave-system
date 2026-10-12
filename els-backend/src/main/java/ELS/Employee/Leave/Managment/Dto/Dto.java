package ELS.Employee.Leave.Managment.Dto;

import ELS.Employee.Leave.Managment.Entity.Employee.Role;
import ELS.Employee.Leave.Managment.Entity.LeaveRequest.Status;
import ELS.Employee.Leave.Managment.Entity.LeaveRequest.Type;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

/** Request and response shapes that match what the Next.js frontend sends and expects. */
public final class Dto {
    private Dto() {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record LoginResponse(String token, Role role, Integer employeeId, String name) {}

    public record NewLeave(@NotNull Type leaveType, @NotNull LocalDate startDate,
                           @NotNull LocalDate endDate, @NotBlank @Size(max = 500) String reason) {}

    public record StatusUpdate(@NotNull Status status) {}

    public record EmployeeInput(@NotBlank String name, @NotBlank @Email String email,
                                @NotBlank String department, @Min(0) int totalLeaves,
                                @NotNull Role role, String password) {}

    public record EmployeeView(Integer employeeId, String name, String email, String department,
                               int totalLeaves, int leaveTaken, Role role) {}

    public record LeaveView(Integer requestId, Integer employeeId, String employeeName, Type leaveType,
                            LocalDate startDate, LocalDate endDate, String reason, Status status) {}
}

package ELS.Employee.Leave.Managment.Repository;

import ELS.Employee.Leave.Managment.Entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Integer> {
    List<LeaveRequest> findByEmployee_EmployeeIdOrderByRequestIdDesc(Integer employeeId);
}

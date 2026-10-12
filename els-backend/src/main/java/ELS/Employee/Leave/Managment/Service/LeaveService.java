package ELS.Employee.Leave.Managment.Service;

import ELS.Employee.Leave.Managment.Dto.Dto.LeaveView;
import ELS.Employee.Leave.Managment.Dto.Dto.NewLeave;
import ELS.Employee.Leave.Managment.Entity.Employee;
import ELS.Employee.Leave.Managment.Entity.LeaveRequest;
import ELS.Employee.Leave.Managment.Entity.LeaveRequest.Status;
import ELS.Employee.Leave.Managment.Exception.ApiException;
import ELS.Employee.Leave.Managment.Repository.EmployeeRepository;
import ELS.Employee.Leave.Managment.Repository.LeaveRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaves;
    private final EmployeeRepository employees;

    public LeaveService(LeaveRequestRepository leaves, EmployeeRepository employees) {
        this.leaves = leaves;
        this.employees = employees;
    }

    /** Days from start to end, counting both days. */
    private static int days(LeaveRequest l) {
        return (int) ChronoUnit.DAYS.between(l.getStartDate(), l.getEndDate()) + 1;
    }

    private static LeaveView view(LeaveRequest l) {
        Employee e = l.getEmployee();
        return new LeaveView(l.getRequestId(), e.getEmployeeId(), e.getName(), l.getLeaveType(),
                l.getStartDate(), l.getEndDate(), l.getReason(), l.getStatus());
    }

    public List<LeaveView> mine(String email) {
        Employee e = employees.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found."));
        return leaves.findByEmployee_EmployeeIdOrderByRequestIdDesc(e.getEmployeeId())
                .stream().map(LeaveService::view).toList();
    }

    public List<LeaveView> all() {
        return leaves.findAll().stream()
                .sorted(Comparator.comparing(LeaveRequest::getRequestId).reversed())
                .map(LeaveService::view).toList();
    }

    @Transactional
    public LeaveView apply(String email, NewLeave in) {
        Employee e = employees.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found."));
        if (in.endDate().isBefore(in.startDate()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "The end date must be the same as or after the start date.");

        LeaveRequest l = new LeaveRequest();
        l.setEmployee(e);
        l.setLeaveType(in.leaveType());
        l.setStartDate(in.startDate());
        l.setEndDate(in.endDate());
        l.setReason(in.reason().trim());
        l.setStatus(Status.PENDING);

        int left = e.getTotalLeaves() - e.getLeaveTaken();
        if (days(l) > left)
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "You asked for " + days(l) + " days but only have " + left + " left.");
        return view(leaves.save(l));
    }

    @Transactional
    public LeaveView decide(Integer id, Status status) {
        if (status == Status.PENDING)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose APPROVED or REJECTED.");
        LeaveRequest l = leaves.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Leave request not found."));
        if (l.getStatus() != Status.PENDING)
            throw new ApiException(HttpStatus.CONFLICT, "This request was already " + l.getStatus().name().toLowerCase() + ".");

        if (status == Status.APPROVED) {
            Employee e = l.getEmployee();
            int left = e.getTotalLeaves() - e.getLeaveTaken();
            if (days(l) > left)
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        e.getName() + " has only " + left + " days left, so this cannot be approved.");
            e.setLeaveTaken(e.getLeaveTaken() + days(l)); // balance goes down on approval
            employees.save(e);
        }
        l.setStatus(status);
        return view(leaves.save(l));
    }
}

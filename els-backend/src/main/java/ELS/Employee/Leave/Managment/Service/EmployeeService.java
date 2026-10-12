package ELS.Employee.Leave.Managment.Service;

import ELS.Employee.Leave.Managment.Dto.Dto.EmployeeInput;
import ELS.Employee.Leave.Managment.Dto.Dto.EmployeeView;
import ELS.Employee.Leave.Managment.Entity.Employee;
import ELS.Employee.Leave.Managment.Exception.ApiException;
import ELS.Employee.Leave.Managment.Repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employees;
    private final PasswordEncoder encoder;

    public EmployeeService(EmployeeRepository employees, PasswordEncoder encoder) {
        this.employees = employees;
        this.encoder = encoder;
    }

    public static EmployeeView view(Employee e) {
        return new EmployeeView(e.getEmployeeId(), e.getName(), e.getEmail(), e.getDepartment(),
                e.getTotalLeaves(), e.getLeaveTaken(), e.getRole());
    }

    public Employee byEmail(String email) {
        return employees.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found."));
    }

    public List<EmployeeView> list() {
        return employees.findAll().stream().map(EmployeeService::view).toList();
    }

    public EmployeeView create(EmployeeInput in) {
        if (in.password() == null || in.password().length() < 6)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
        if (employees.existsByEmail(in.email()))
            throw new ApiException(HttpStatus.CONFLICT, "An employee with this email already exists.");
        Employee e = new Employee();
        apply(e, in);
        e.setPassword(encoder.encode(in.password()));
        return view(employees.save(e));
    }

    public EmployeeView update(Integer id, EmployeeInput in) {
        Employee e = employees.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found."));
        if (!e.getEmail().equalsIgnoreCase(in.email()) && employees.existsByEmail(in.email()))
            throw new ApiException(HttpStatus.CONFLICT, "An employee with this email already exists.");
        apply(e, in);
        if (in.password() != null && !in.password().isBlank()) {
            if (in.password().length() < 6)
                throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters.");
            e.setPassword(encoder.encode(in.password()));
        }
        return view(employees.save(e));
    }

    public void delete(Integer id, String currentEmail) {
        Employee e = employees.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Employee not found."));
        if (e.getEmail().equalsIgnoreCase(currentEmail))
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot delete your own account.");
        employees.delete(e);
    }

    private void apply(Employee e, EmployeeInput in) {
        e.setName(in.name().trim());
        e.setEmail(in.email().trim());
        e.setDepartment(in.department().trim());
        e.setTotalLeaves(in.totalLeaves());
        e.setRole(in.role());
    }
}

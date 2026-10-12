package ELS.Employee.Leave.Managment.Controller;

import ELS.Employee.Leave.Managment.Dto.Dto.EmployeeInput;
import ELS.Employee.Leave.Managment.Dto.Dto.EmployeeView;
import ELS.Employee.Leave.Managment.Dto.Dto.LeaveView;
import ELS.Employee.Leave.Managment.Dto.Dto.StatusUpdate;
import ELS.Employee.Leave.Managment.Service.EmployeeService;
import ELS.Employee.Leave.Managment.Service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Only users with the ADMIN role can reach /api/admin/** (set in SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final LeaveService leaves;
    private final EmployeeService employees;

    public AdminController(LeaveService leaves, EmployeeService employees) {
        this.leaves = leaves;
        this.employees = employees;
    }

    @GetMapping("/leaves")
    public List<LeaveView> allLeaves() {
        return leaves.all();
    }

    @PatchMapping("/leaves/{id}/status")
    public LeaveView decide(@PathVariable Integer id, @Valid @RequestBody StatusUpdate in) {
        return leaves.decide(id, in.status());
    }

    @GetMapping("/employees")
    public List<EmployeeView> listEmployees() {
        return employees.list();
    }

    @PostMapping("/employees")
    public EmployeeView create(@Valid @RequestBody EmployeeInput in) {
        return employees.create(in);
    }

    @PutMapping("/employees/{id}")
    public EmployeeView update(@PathVariable Integer id, @Valid @RequestBody EmployeeInput in) {
        return employees.update(id, in);
    }

    @DeleteMapping("/employees/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id, Authentication auth) {
        employees.delete(id, auth.getName());
    }
}

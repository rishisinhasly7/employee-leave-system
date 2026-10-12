package ELS.Employee.Leave.Managment.Controller;

import ELS.Employee.Leave.Managment.Dto.Dto.EmployeeView;
import ELS.Employee.Leave.Managment.Service.EmployeeService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping("/me")
    public EmployeeView me(Authentication auth) {
        return EmployeeService.view(service.byEmail(auth.getName()));
    }
}

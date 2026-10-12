package ELS.Employee.Leave.Managment.Controller;

import ELS.Employee.Leave.Managment.Dto.Dto.LoginRequest;
import ELS.Employee.Leave.Managment.Dto.Dto.LoginResponse;
import ELS.Employee.Leave.Managment.Entity.Employee;
import ELS.Employee.Leave.Managment.Exception.ApiException;
import ELS.Employee.Leave.Managment.Repository.EmployeeRepository;
import ELS.Employee.Leave.Managment.Service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmployeeRepository employees;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(EmployeeRepository employees, PasswordEncoder encoder, JwtService jwt) {
        this.employees = employees;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest in) {
        Employee e = employees.findByEmail(in.email().trim())
                .filter(x -> encoder.matches(in.password(), x.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Wrong email or password."));
        return new LoginResponse(jwt.createToken(e), e.getRole(), e.getEmployeeId(), e.getName());
    }
}

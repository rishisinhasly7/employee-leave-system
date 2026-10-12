package ELS.Employee.Leave.Managment.Controller;

import ELS.Employee.Leave.Managment.Dto.Dto.LeaveView;
import ELS.Employee.Leave.Managment.Dto.Dto.NewLeave;
import ELS.Employee.Leave.Managment.Service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService service;

    public LeaveController(LeaveService service) {
        this.service = service;
    }

    @GetMapping("/my")
    public List<LeaveView> mine(Authentication auth) {
        return service.mine(auth.getName());
    }

    @PostMapping
    public LeaveView apply(@Valid @RequestBody NewLeave in, Authentication auth) {
        return service.apply(auth.getName(), in);
    }
}

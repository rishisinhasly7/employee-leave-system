package ELS.Employee.Leave.Managment.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    public enum Role { EMPLOYEE, ADMIN }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer employeeId;

    private String name;
    private String email;
    private String department;
    private int totalLeaves;
    private int leaveTaken;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String password; // BCrypt hash

    public Integer getEmployeeId() { return employeeId; }
    public void setEmployeeId(Integer employeeId) { this.employeeId = employeeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public int getTotalLeaves() { return totalLeaves; }
    public void setTotalLeaves(int totalLeaves) { this.totalLeaves = totalLeaves; }

    public int getLeaveTaken() { return leaveTaken; }
    public void setLeaveTaken(int leaveTaken) { this.leaveTaken = leaveTaken; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}

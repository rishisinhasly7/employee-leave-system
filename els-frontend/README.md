# ELS frontend (Next.js + shadcn/ui)

Frontend for the Employee Leave Management System. It talks to a Spring Boot backend over JSON.

## Run it

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL if your backend is not on :8080
npm run dev                        # http://localhost:3000
```

Add more shadcn components any time with `npx shadcn@latest add dialog` (config is in `components.json`).

## Screens

| Who | Route | What it does |
|---|---|---|
| Everyone | `/login` | Sign in, then land on the right home page for your role |
| Employee | `/dashboard` | Leave balance (one block per day) and the last 5 requests |
| Employee | `/apply` | Pick type, dates and reason. Checks the balance before sending |
| Employee | `/my-leaves` | All your requests with status |
| Admin | `/admin/requests` | Filter by status, approve or reject |
| Admin | `/admin/employees` | Add, edit, delete employees |

## API your Spring Boot app needs

Every call except login sends `Authorization: Bearer <token>`. Dates are `yyyy-MM-dd`.
Errors should return JSON like `{ "message": "Why it failed" }`. The message is shown to the user.

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | `{ token, role, employeeId, name }` (`role` is `EMPLOYEE` or `ADMIN`) |
| GET | `/api/employees/me` | | `{ employeeId, name, email, department, totalLeaves, leaveTaken }` |
| GET | `/api/leaves/my` | | `LeaveRequest[]` |
| POST | `/api/leaves` | `{ leaveType, startDate, endDate, reason }` | `LeaveRequest` (status starts as `PENDING`) |
| GET | `/api/admin/leaves` | | `LeaveRequest[]` for everyone |
| PATCH | `/api/admin/leaves/{id}/status` | `{ status: "APPROVED" \| "REJECTED" }` | `LeaveRequest` |
| GET | `/api/admin/employees` | | `Employee[]` |
| POST | `/api/admin/employees` | `{ name, email, department, totalLeaves, role, password }` | `Employee` |
| PUT | `/api/admin/employees/{id}` | same, `password` optional | `Employee` |
| DELETE | `/api/admin/employees/{id}` | | 204 |

`LeaveRequest` = `{ requestId, employeeId, employeeName, leaveType, startDate, endDate, reason, status }`
- `leaveType`: `CASUAL`, `SICK`, `ANNUAL`, `OTHER`
- `status`: `PENDING`, `APPROVED`, `REJECTED`

Tip: when an admin approves a request, add the days to that employee's `leaveTaken` in the backend so the balance stays correct.

## CORS (Spring Boot)

The browser calls your backend from another port, so allow it:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                .allowedHeaders("*");
    }
}
```
If you use Spring Security, also call `http.cors(Customizer.withDefaults())`.

## Notes

- The login token is kept in `localStorage` (simple for a college project). For production, use an httpOnly cookie.
- All API calls live in `lib/api.ts`. Change a path there and the whole app follows.

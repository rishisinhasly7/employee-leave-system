# ELS backend (Spring Boot + MySQL)

1. Start MySQL in XAMPP and run els_schema.sql once (creates els_db with sample data).
2. Delete the old journalApp files (see below), then:  mvn clean compile
3. Run:  mvn spring-boot:run     (API at http://localhost:8080)
4. In the frontend, set NEXT_PUBLIC_API_URL=http://localhost:8080

Test login: admin@els.com / Password@123
Delete these old files (they are MongoDB / journalApp code): UserRepositeryImpl, UserRepository,
UserEntryService, UserContoller and the old AdminController.

User Authentication System
Overview
This project is a full-stack user authentication system with role-based access control. It features a frontend built with Angular and a backend powered by Spring Boot, using MongoDB for data storage. Users can register, log in, and view their profiles, while admins can manage users (add, edit, delete) via a secure admin dashboard. The application includes robust validations, a responsive UI, and secure API endpoints.
Features

User Registration and Login: Users can sign up with validated inputs (email, username, password, phone, age) and log in using JWT-based authentication.
Role-Based Access:
Regular users (USER role) can access their profile and are restricted from admin routes.
Admins (ADMIN role) can access a dashboard to manage users (add, edit, delete).


Admin Dashboard:
Toggleable "Add User" form with a two-column layout (email, username, password on one side; phone, age, role on the other).
Edit user form with validations.
"Back to Home" and "Logout" buttons at the top-left.


Frontend Validations: Reactive forms validate email format, 10-digit phone numbers, non-negative age, and required fields.
Backend Validations: Ensures unique emails, valid formats, and secure password storage.
Responsive UI: Styled with Tailwind CSS, Animate.css, and Poppins/Roboto fonts, including a navbar and login slider.
Security: JWT authentication, role-based authorization, and guarded routes prevent unauthorized access.

Technologies Used
Frontend

Angular: v14+ for building the SPA.
Tailwind CSS: For responsive styling.
Animate.css: For animations (e.g., fade-in effects).
Reactive Forms: For form validations.
Fonts: Poppins (headings), Roboto (body text).

Backend

Spring Boot: v3+ for RESTful APIs.
MongoDB: Database for storing user data.
Spring Security: JWT-based authentication and role-based authorization.
Jakarta Validation: For DTO validations (e.g., @Email, @Pattern).
BCrypt: For password encryption.

Prerequisites

Node.js: v16+ (for Angular frontend).
npm: v8+ (for installing frontend dependencies).
Java: JDK 17+ (for Spring Boot backend).
Maven: v3.8+ (for building the backend).
MongoDB: v5+ (local or cloud instance).
Git: For cloning the repository.

Setup Instructions
1. Clone the Repository
git clone <repository-url>
cd <repository-name>

2. Backend Setup

Navigate to the backend directory:cd backend


Configure MongoDB:
Ensure MongoDB is running locally (mongod) or provide a cloud MongoDB URI.
Update src/main/resources/application.properties with your MongoDB connection details:spring.data.mongodb.uri=mongodb://localhost:27017/userdb




Install backend dependencies and build:mvn clean install


Run the backend:mvn spring-boot:run


The backend will start on http://localhost:8080.



3. Frontend Setup

Navigate to the frontend directory:cd frontend


Install dependencies:
Since node_modules was excluded from Git, install the required packages:npm install




Run the frontend:ng serve


The frontend will start on http://localhost:4200.



4. Verify Setup

Open http://localhost:4200 in a browser.
Use the navbar to access the signup (/register) or login (/login) pages.
Log in as an admin (e.g., admin1@example.com, password: admin123) to access the admin dashboard (/admin).
Log in as a regular user (e.g., user1@example.com, password: user123) to access the user profile (/profile).

Project Structure
Frontend (frontend/)
src/
├── app/
│   ├── admin-dashboard/           # Admin dashboard component (manage users, add/edit forms)
│   ├── auth.guard.ts             # Route guard for role-based access
│   ├── auth.service.ts           # Handles authentication (login, logout, token storage)
│   ├── home/                     # Home page component
│   ├── login/                    # Login component with slider
│   ├── register/                 # Registration component with validated form
│   ├── user-profile/             # User profile component
│   ├── app-routing.module.ts     # Route definitions with guards
│   ├── app.component.*           # Main app component with navbar and login slider
│   ├── app.module.ts             # Main module with imports
├── styles.css                    # Global styles (Tailwind CSS)
├── angular.json                  # Angular configuration
├── package.json                  # Frontend dependencies

Backend (backend/)
src/main/java/com/example/userauth/
├── config/                       # Security configuration (JWT, Spring Security)
├── controller/                   # REST controllers (AuthController for auth and admin endpoints)
├── dto/                         # Data Transfer Objects (RegisterRequest, etc.)
├── model/                       # Entity models (User)
├── repository/                  # MongoDB repository (UserRepository)
├── util/                        # Utilities (JwtUtil, JwtAuthenticationFilter)
├── application.properties        # Configuration (MongoDB URI, etc.)
pom.xml                           # Maven dependencies

Running the Application

Start MongoDB:mongod


Start the backend:cd backend
mvn spring-boot:run


Start the frontend:cd frontend
ng serve


Access the app at http://localhost:4200.

Testing
Frontend

Registration:
Navigate to /register and try invalid inputs (e.g., user5@example, 5-digit phone, negative age).
Verify error messages and disabled submit button.


Login:
Log in as admin1@example.com (admin) or user1@example.com (user).
Confirm redirection to /admin (admin) or /profile (user).


Admin Dashboard:
Log in as admin, access /admin.
Verify top-left "Back to Home" and "Logout" buttons.
Click "Add User" to toggle the two-column form, test validations, and add a user.
Edit a user and test validations.
Try accessing /admin as a non-admin user (should redirect to /profile).


Responsive UI:
Test on different screen sizes to ensure Tailwind CSS responsiveness.



Backend

Use Postman to test APIs:
POST /api/auth/register: Test with invalid email, phone, or duplicate email.
POST /api/auth/login: Test with correct/incorrect credentials.
POST /api/auth/admin/user: Test as admin (valid token) and non-admin (should return 403).


Check MongoDB (userdb.users) for correct data storage:use userdb
db.users.find().pretty()



Security and Validations

Frontend Validations:
Reactive forms ensure valid email (Validators.email), 10-digit phone (pattern('^\\d{10}$')), non-negative age (min(0)), and required fields.
Submit buttons are disabled until forms are valid.


Backend Validations:
RegisterRequest DTO enforces email format (@Email, @Pattern), 10-digit phone (@Pattern), non-negative age (@Min), and unique emails (@Indexed(unique = true)).
JWT authentication secures API endpoints.
Role-based authorization restricts /api/auth/admin/* to ADMIN role.


Route Guards:
AuthGuard restricts /admin to admins and redirects non-admins to /profile.
Logged-in non-admins are blocked from /register.



Notes

The node_modules folder was excluded from Git to reduce repository size. Run npm install in the frontend directory to restore dependencies.
Ensure MongoDB is running before starting the backend.
The project uses Tailwind CSS for styling, so no additional CSS setup is needed beyond npm install.
The login slider in AppComponent slides from the right and closes on outside click.

Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request.

License
This project is licensed under the MIT License.
Contact
For issues or questions, please open an issue on GitHub or contact the repository owner.

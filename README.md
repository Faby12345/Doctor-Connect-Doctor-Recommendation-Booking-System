 DoctorConnect
A secure, full-stack healthcare appointment scheduling platform engineered for performance, data integrity, and strict access control.

DoctorConnect bridges the gap between patients and healthcare providers. It features a decoupled architecture with a Java/Spring Boot backend and a strictly-typed React/TypeScript frontend, powered by PostgreSQL.

 Architectural Highlights
This project was built with an enterprise mindset, focusing heavily on backend optimization and security:

Zero-Trust Security: Implemented stateless authentication using JWTs and custom Spring Security filters. Role-Based Access Control (RBAC) securely separates PATIENT, DOCTOR, and ADMIN workflows.

Strict API Contracts: Utilized the DTO (Data Transfer Object) pattern with custom mappers. Database entities are strictly protected and never leaked to the client, preventing Insecure Direct Object Reference (IDOR) vulnerabilities.

Database Optimization: Actively squashed N+1 query bottlenecks using optimized JPA fetch strategies when loading complex entity relationships (like Doctors, Reviews, and Appointments).

ACID Compliance & Concurrency: Leveraged Spring's @Transactional proxies to manage complex booking workflows. State transitions (Accepting/Rejecting appointments) are strictly isolated to prevent race conditions and double-booking.

Clean Frontend Architecture: Abstracted API logic and state management into custom React hooks, completely separating business logic from Tailwind CSS presentation components.

 Tech Stack
Backend:

Java 21

Spring Boot 3 (Web, Data JPA, Security)

PostgreSQL

JSON Web Tokens (JWT)

Frontend:

React 18 & TypeScript

Vite

Tailwind CSS

React Router

Infrastructure:

Docker & Docker Compose (Backend & Database)

 Getting Started (Local Development)
Currently, the Database and Backend API are containerized via Docker for seamless setup, while the Frontend is run locally for rapid UI development.

Prerequisites
Docker Desktop installed and running.

Node.js (v18+) installed.

1. Clone the Repository
Bash
git clone https://github.com/YourUsername/Doctor_Connect.git
cd Doctor_Connect
2. Start the Backend & Database (Docker)
The docker-compose.yml file is configured to spin up the PostgreSQL database and the Spring Boot API. (Note: Frontend containerization is currently commented out for local dev flexibility).

Bash
# Run this from the root directory
docker-compose up -d
The API will be available at http://localhost:8080.

3. Start the Frontend (Local)
Open a new terminal window and navigate to the frontend directory:

Bash
cd frontend
npm install
npm run dev
The React application will be available at http://localhost:5173 (or the port specified by Vite).

 Author
Fabian Turle

LinkedIn: [Your LinkedIn URL]

Role: Full-Stack Software Engineer

If you are an Engineering Manager or Recruiter, feel free to reach out on LinkedIn! I am actively open to discussing system architecture, FinTech, and AI-driven development.

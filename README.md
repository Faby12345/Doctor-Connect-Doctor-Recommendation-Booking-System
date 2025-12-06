# doctor-connect
A full-stack doctor recommendation & appointment booking system built with Spring Boot, React, TypeScript, PostgreSQL, and Tailwind CSS.

Overview

Doctor Connect is a medical marketplace where patients can search for doctors, explore profiles, check availability, and book appointments. Doctors can edit profiles, manage availability, and handle bookings. Admins can verify doctors.

The project is intentionally designed as a clean monolith for learning modern full-stack development using:

 Spring Boot (REST API, JPA, security, validation)

 React + TypeScript + Tailwind (UI, routing, forms, API hooks)

 PostgreSQL + Flyway (database + migrations)

 Features
 
1. Patient Features

Search doctors by specialty, city, price, availability

View doctor profiles (bio, services, pricing, ratings)

Book appointment slots

View upcoming appointments

Leave reviews after completed visits


2. Doctor Features

Create & update profile

Define prices & specialty

Add/remove available appointment slots

View & manage appointments (confirm/cancel)


3. Admin Features

Verify doctors to improve patient trust



Recommendation Engine (Simple Scoring)

Doctors are ranked based on:

Specialty match

City match

Verified status

Price match vs patient filters

Has an open slot within 7 days

Rating bonus (rating_avg / 5)



Tech Stack

1. Backend:

Java 21
Spring Boot 3 (Web, Security, Data JPA, Validation)
PostgreSQL
Flyway (schema migrations)


2. Frontend

React 18 + TypeScript
Vite
React Router
React Query
React Hook Form + Zod
Tailwind CSS
Developer Tools
Docker (optional for PostgreSQL)
Testcontainers / JUnit
ESLint + Prettier

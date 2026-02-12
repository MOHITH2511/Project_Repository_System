# Project Repository System

## Overview

Project Repository System is a web-based Project Lifecycle Management Platform designed to manage academic projects through a structured, role-based workflow.  
The system replaces manual project tracking with a centralized, secure, and searchable repository.

The platform focuses on governance, traceability, and long-term knowledge retention rather than simple file storage.

---

## Problem Statement

Academic projects are often managed using fragmented and manual processes, resulting in:

- Poor visibility of project status
- Lack of version control for submissions
- Inconsistent review workflows
- Limited historical traceability
- Difficulty retrieving past projects

This system introduces a structured lifecycle model with secure access controls and auditability.

---

## Core Features

- User Authentication & Authorization (JWT-based)
- Role-Based Access Control (RBAC)
- Project Lifecycle Management
- Versioned Document Submissions
- Faculty Review Workflow
- Searchable Project Repository
- Git Repository Linking
- Audit Logging & Traceability
- Administrative Controls

---

## Technology Stack

**Backend**
- Java
- Spring Boot
- Spring Web (REST APIs)
- Spring Data JPA
- Hibernate (ORM)
- Spring Security

**Database**
- PostgreSQL (or MySQL)

**Build Tool**
- Maven

**Authentication Mechanism**
- JWT (JSON Web Tokens)

---

## System Architecture

The system follows a layered architecture within a modular monolithic design.

**High-Level Flow**

Client → REST API → Controller → Service → Repository → Database

Key architectural principles:

- Separation of concerns
- Stateless request handling
- Centralized dependency management
- Scalable security model
- Extensible API design

(Architecture diagram included in `/docs`)

---

## Database Design Philosophy

The data model is designed to support:

- Clear entity relationships
- Lifecycle state transitions
- Version tracking
- Auditability of actions
- Future scalability

Primary entities include:

- User
- Project
- ProjectVersion
- Review
- AuditLog

(ER Diagram included in `/docs`)

---

## Setup Instructions

### Prerequisites

- Java 17+ (recommended)
- Maven
- PostgreSQL / MySQL
- Git

---

### Steps to Run

1. Clone the repository

   ```bash
   git clone <repository_url>

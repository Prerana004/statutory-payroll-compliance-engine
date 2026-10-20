# Statutory Payroll Compliance Engine

A full-stack payroll management system focused on statutory and compliance configuration for Indian payroll processing. The system enables dynamic configuration of Provident Fund (PF), Employee State Insurance (ESI), and Professional Tax (PT) rules without requiring source code changes, making it maintainable and legislation-ready.

This project is developed across two modules. Module 1 covers organization registration and role-based authentication. Module 2 (this repository) covers the statutory compliance configuration engine.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Statutory Rules Configured](#statutory-rules-configured)
- [QA and Manual Testing](#qa-and-manual-testing)
- [SQL Compliance Audit Layer](#sql-compliance-audit-layer)
- [Role-Based Access Control](#role-based-access-control)

---

## Project Overview

The Statutory Payroll Compliance Engine is inspired by enterprise payroll platforms such as Zoho Payroll. It addresses the challenge of keeping payroll systems synchronized with frequently changing labor legislation across Indian states.

Key legislative frameworks covered:

- Employees' Provident Fund and Miscellaneous Provisions Act, 1952
- Employees' State Insurance Act, 1948
- State-specific Professional Tax Acts (Karnataka, Maharashtra, Tamil Nadu, West Bengal)

---

## Features

- Organization registration with SuperAdmin account creation
- JWT-based authentication with bcrypt password hashing
- Role-Based Access Control (SuperAdmin, PayrollAdmin, HRAdmin, Employee)
- Country and state-wise statutory rule configuration via admin interface
- Dynamic PF, ESI, and Professional Tax rule management stored in MongoDB
- Protected REST API endpoints with JWT middleware
- Rule deletion restricted to SuperAdmin role
- Dark mode toggle on the compliance dashboard
- Mobile-responsive navigation
- Excel-based manual test suite with 30 test cases covering boundary conditions
- SQL audit validation queries for relational compliance verification

---

## Technology Stack

**Frontend**
- React (Vite)
- JavaScript (ES6+)
- Axios
- React Router DOM

**Backend**
- Node.js
- Express.js
- Mongoose (MongoDB ODM)
- bcryptjs
- jsonwebtoken
- dotenv

**Database**
- MongoDB Atlas

**QA and Testing**
- Microsoft Excel (IF, MIN, ROUND, XLOOKUP formulas)
- SQL (schema design and SELECT validation queries)
- Python with openpyxl (test suite generation)

---

## Project Structure

```
statutory-payroll-compliance-engine/
|
|-- backend/
|   |-- config/
|   |   └-- db.js                      # MongoDB Atlas connection
|   |-- middleware/
|   |   └-- authMiddleware.js          # JWT verification middleware
|   |-- models/
|   |   |-- Organization.js            # Organization schema
|   |   |-- User.js                    # User schema with RBAC roles
|   |   └-- Statutory.js               # Statutory rule schema
|   |-- routes/
|   |   |-- authRoutes.js              # POST /register, POST /login
|   |   |-- statutoryRoutes.js         # CRUD for statutory rules
|   |   └-- auditRoutes.js             # Audit log routes
|   └-- server.js                      # Express app entry point
|
|-- frontend/
|   └-- src/
|       |-- components/
|       |   |-- MobileNav.jsx          # Responsive mobile navigation
|       |   └-- ProtectedRoute.jsx     # JWT-guarded route wrapper
|       |-- pages/
|       |   |-- Login.jsx              # Login page
|       |   |-- Signup.jsx             # Organization registration page
|       |   |-- Admin.jsx              # Admin dashboard
|       |   └-- SuperAdmin.jsx         # SuperAdmin dashboard
|       |-- utils/
|       |   └-- auth.js                # Token and role utility functions
|       |-- App.jsx                    # Statutory configuration UI
|       └-- Dashboard.jsx              # Rules summary dashboard
|
└-- qa-manual-testing/
    |-- Statutory_Rule_Engine_Test_Suite.xlsx   # 30-case manual test suite
    |-- compliance_audit_queries.sql            # 5 SQL validation queries
    └-- generate_test_suite.py                  # Excel workbook generator
```

---

## Getting Started

### Prerequisites

- Node.js v18 or above
- Python 3.10 or above (for test suite generation only)
- MongoDB Atlas account with a cluster

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/payrollDB?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:

```bash
npm start
```

The server runs on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Register organization and SuperAdmin | No |
| POST | /api/auth/login | Login and receive JWT token | No |

**Register Request Body**
```json
{
  "orgName": "Acme Corporation",
  "email": "admin@acme.com",
  "password": "SecurePass@123"
}
```

**Login Request Body**
```json
{
  "email": "admin@acme.com",
  "password": "SecurePass@123"
}
```

### Statutory Rules

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/statutory | Fetch all statutory rules | Yes |
| POST | /api/statutory | Create a new statutory rule | Yes |
| DELETE | /api/statutory/:id | Delete a rule (SuperAdmin only) | Yes |

**Create Rule Request Body**
```json
{
  "country": "India",
  "pfPercentage": 12,
  "esiPercentage": 3.25,
  "professionalTax": 200
}
```

All protected endpoints require the following header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Statutory Rules Configured

| Component | Rate | Wage Basis | Ceiling | Governing Act |
|-----------|------|-----------|---------|---------------|
| Provident Fund (PF) | 12% | Basic Wage | Rs. 15,000 (basic wage cap) | EPF and MP Act, 1952 |
| ESI - Employee | 0.75% | Gross Salary | Rs. 21,000 gross wage limit | ESI Act, 1948 |
| ESI - Employer | 3.25% | Gross Salary | Rs. 21,000 gross wage limit | ESI Act, 1948 |
| Professional Tax - Karnataka | Up to Rs. 200/month | Gross Salary | Slab-based | Karnataka Tax on Professions Act, 1976 |
| Professional Tax - Maharashtra | Up to Rs. 300/month (Feb) | Gross Salary | Slab-based | Maharashtra State Tax on Professions Act, 1975 |
| Professional Tax - Tamil Nadu | Up to Rs. 208/month | Gross Salary | Slab-based | TN Municipal Laws Amendment Act |
| Professional Tax - West Bengal | Rs. 110/month | Gross Salary | Flat | WB State Tax on Professions Act, 1979 |

**PF Deduction Formula**

```
PF Deduction = 12% x MIN(Basic Wage, 15000)
Maximum PF deduction = Rs. 1,800 per month
```

**ESI Deduction Formula**

```
If Gross Salary <= 21,000:
    ESI Deduction = 0.75% x Gross Salary
Else:
    ESI Deduction = 0 (employee is exempt)
```

---

## QA and Manual Testing

The `qa-manual-testing/` folder contains a professional test suite aligned with enterprise QA standards.

### Statutory_Rule_Engine_Test_Suite.xlsx

**Tab 1 - Legislative_Research_Matrix**

A structured reference table mapping each statutory component to its governing act, applicable rates, wage ceilings, state scope, and penalty clauses. Covers PF, ESI, and state-wise PT slabs for four Indian states.

**Tab 2 - Excel_Calculation_Benchmark**

Deduction calculations for 20 sample employees across salary ranges using Excel formulas:

| Formula | Purpose |
|---------|---------|
| `=MIN(basic, 15000)` | Determines PF-eligible basic wage |
| `=ROUND(pf_eligible * 0.12, 2)` | Calculates PF deduction |
| `=IF(gross <= 21000, "Y", "N")` | Determines ESI eligibility |
| `=IF(esi_eligible, ROUND(gross * 0.0075, 2), 0)` | Calculates ESI deduction |
| `=IF(net = ROUND(gross - pf - esi - pt, 2), "Pass", "Fail")` | Net salary cross-check |

Includes boundary employees at gross salary Rs. 20,999, Rs. 21,000, and Rs. 21,001 to validate ESI cutoff behavior.

**Tab 3 - Manual_Test_Cases_Log**

30 test cases (TC_01 to TC_30) covering:

- Organization registration and login validation
- Duplicate email and empty field handling
- JWT expiry and ProtectedRoute access control
- PF cap boundary at Rs. 14,999, Rs. 15,000, and Rs. 15,001 basic wage
- ESI boundary at Rs. 20,999, Rs. 21,000, and Rs. 21,001 gross salary
- Professional Tax slab transitions by state
- Net salary reconciliation
- Role-based delete restriction (SuperAdmin vs PayrollAdmin)
- Dark mode and mobile responsive UI

Result: 29 Pass, 1 Fail (February PT slab exception not yet implemented in app)

---

## SQL Compliance Audit Layer

The file `qa-manual-testing/compliance_audit_queries.sql` provides a relational layer for statutory audit verification. It includes:

**Schema**
- `StatutoryRules` table - stores PF, ESI, and PT rule configurations per country and state
- `EmployeePayroll` table - stores monthly payroll records with deduction breakdown

**Validation Queries**

| Query | Purpose |
|-------|---------|
| Query 1 | List all active statutory rules with formatted output |
| Query 2 | ESI boundary validation for employees within Rs. 500 of the Rs. 21,000 ceiling |
| Query 3 | PF deduction accuracy check with Rs. 15,000 wage cap enforcement |
| Query 4 | Net salary reconciliation across all payroll records |
| Query 5 | Monthly compliance audit summary report with pass rate per statutory component |

---

## Role-Based Access Control

| Role | Register Rule | View Rules | Delete Rule |
|------|--------------|------------|-------------|
| SuperAdmin | Yes | Yes | Yes |
| PayrollAdmin | Yes | Yes | No |
| HRAdmin | Yes | Yes | No |
| Employee | No | No | No |

Role is embedded in the JWT payload and enforced on both the frontend (UI visibility) and the backend (API middleware).

---

## License

This project is developed for academic and portfolio purposes.

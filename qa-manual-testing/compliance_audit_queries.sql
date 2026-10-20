-- =============================================================
--  Payroll Management System – Compliance Audit SQL Queries
--  Module 2: Statutory & Compliance Configuration
--  Author  : Payroll Dev Team
--  Purpose : Relational validation layer alongside MongoDB store
-- =============================================================


-- -------------------------------------------------------------
-- TABLE 1: StatutoryRules
--   Stores country/state-wise PF, ESI, and PT configuration.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS StatutoryRules (
    rule_id          INT           PRIMARY KEY AUTO_INCREMENT,
    country          VARCHAR(100)  NOT NULL,
    state            VARCHAR(100)  DEFAULT 'All',
    pf_percentage    DECIMAL(5,2)  NOT NULL COMMENT 'Employee + Employer PF %',
    pf_wage_cap      DECIMAL(10,2) DEFAULT 15000.00 COMMENT 'Max basic wage for PF calc (INR)',
    esi_employee_pct DECIMAL(5,2)  DEFAULT 0.75  COMMENT 'Employee ESI contribution %',
    esi_employer_pct DECIMAL(5,2)  DEFAULT 3.25  COMMENT 'Employer ESI contribution %',
    esi_wage_limit   DECIMAL(10,2) DEFAULT 21000.00 COMMENT 'Gross wage ceiling for ESI (INR)',
    professional_tax DECIMAL(10,2) DEFAULT 200.00 COMMENT 'Monthly PT deduction (INR)',
    effective_from   DATE          NOT NULL,
    created_by       VARCHAR(100)  DEFAULT 'SuperAdmin',
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- -------------------------------------------------------------
-- TABLE 2: EmployeePayroll
--   Stores monthly payroll records per employee.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS EmployeePayroll (
    payroll_id        INT            PRIMARY KEY AUTO_INCREMENT,
    employee_id       VARCHAR(20)    NOT NULL,
    employee_name     VARCHAR(150)   NOT NULL,
    department        VARCHAR(100),
    basic_wage        DECIMAL(10,2)  NOT NULL,
    gross_salary      DECIMAL(10,2)  NOT NULL,
    pf_deduction      DECIMAL(10,2)  NOT NULL,
    esi_deduction     DECIMAL(10,2)  NOT NULL,
    pt_deduction      DECIMAL(10,2)  NOT NULL,
    net_salary        DECIMAL(10,2)  NOT NULL,
    payroll_month     DATE           NOT NULL COMMENT 'First day of payroll month',
    rule_id           INT,
    FOREIGN KEY (rule_id) REFERENCES StatutoryRules(rule_id)
);


-- =============================================================
--  SEED DATA – Sample Statutory Rules (India)
-- =============================================================
INSERT INTO StatutoryRules
    (country, state, pf_percentage, pf_wage_cap, esi_employee_pct,
     esi_employer_pct, esi_wage_limit, professional_tax, effective_from)
VALUES
    ('India', 'All',           12.00, 15000.00, 0.75, 3.25, 21000.00, 200.00, '2024-04-01'),
    ('India', 'Karnataka',     12.00, 15000.00, 0.75, 3.25, 21000.00, 200.00, '2024-04-01'),
    ('India', 'Maharashtra',   12.00, 15000.00, 0.75, 3.25, 21000.00, 300.00, '2024-04-01'),
    ('India', 'Tamil Nadu',    12.00, 15000.00, 0.75, 3.25, 21000.00, 208.00, '2024-04-01'),
    ('India', 'West Bengal',   12.00, 15000.00, 0.75, 3.25, 21000.00, 110.00, '2024-04-01');


-- =============================================================
--  VALIDATION QUERIES
-- =============================================================

-- -------------------------------------------------------------
-- QUERY 1: List all active statutory rules with full detail
--   Use case: Verify rules stored in MongoDB match relational DB
-- -------------------------------------------------------------
SELECT
    rule_id,
    country,
    state,
    CONCAT(pf_percentage, '%')           AS pf_rate,
    CONCAT('₹', FORMAT(pf_wage_cap, 0))  AS pf_wage_cap,
    CONCAT(esi_employee_pct, '%')         AS esi_employee,
    CONCAT(esi_employer_pct, '%')         AS esi_employer,
    CONCAT('₹', FORMAT(esi_wage_limit, 0)) AS esi_ceiling,
    CONCAT('₹', professional_tax)         AS monthly_pt,
    effective_from
FROM StatutoryRules
ORDER BY state ASC;


-- -------------------------------------------------------------
-- QUERY 2: ESI Boundary Validation
--   Employees with gross salary within ±₹500 of ESI cutoff (₹21,000)
--   Tests the exact TC_15–TC_17 boundary cases from test suite
-- -------------------------------------------------------------
SELECT
    ep.employee_id,
    ep.employee_name,
    ep.gross_salary,
    CASE
        WHEN ep.gross_salary <= sr.esi_wage_limit
            THEN ROUND(ep.gross_salary * sr.esi_employee_pct / 100, 2)
        ELSE 0
    END                                              AS expected_esi_deduction,
    ep.esi_deduction                                  AS actual_esi_deduction,
    CASE
        WHEN ep.gross_salary <= sr.esi_wage_limit
             AND ROUND(ep.gross_salary * sr.esi_employee_pct / 100, 2) = ep.esi_deduction
            THEN 'PASS'
        WHEN ep.gross_salary > sr.esi_wage_limit
             AND ep.esi_deduction = 0
            THEN 'PASS'
        ELSE 'FAIL'
    END                                               AS test_status
FROM EmployeePayroll ep
JOIN StatutoryRules sr ON ep.rule_id = sr.rule_id
WHERE ep.gross_salary BETWEEN (sr.esi_wage_limit - 500) AND (sr.esi_wage_limit + 500)
ORDER BY ep.gross_salary ASC;


-- -------------------------------------------------------------
-- QUERY 3: PF Deduction Accuracy Check
--   Validates PF is capped at ₹15,000 basic wage (12% max = ₹1,800)
-- -------------------------------------------------------------
SELECT
    ep.employee_id,
    ep.employee_name,
    ep.basic_wage,
    ROUND(
        LEAST(ep.basic_wage, sr.pf_wage_cap) * sr.pf_percentage / 100,
        2
    )                                AS expected_pf,
    ep.pf_deduction                  AS actual_pf,
    CASE
        WHEN ROUND(LEAST(ep.basic_wage, sr.pf_wage_cap) * sr.pf_percentage / 100, 2)
             = ep.pf_deduction
            THEN 'PASS'
        ELSE 'FAIL'
    END                              AS pf_status
FROM EmployeePayroll ep
JOIN StatutoryRules sr ON ep.rule_id = sr.rule_id
ORDER BY ep.basic_wage DESC;


-- -------------------------------------------------------------
-- QUERY 4: Net Salary Reconciliation
--   Ensures net_salary = gross_salary - pf - esi - pt for all records
-- -------------------------------------------------------------
SELECT
    employee_id,
    employee_name,
    gross_salary,
    pf_deduction,
    esi_deduction,
    pt_deduction,
    net_salary                                               AS stored_net,
    ROUND(gross_salary - pf_deduction - esi_deduction - pt_deduction, 2) AS calculated_net,
    CASE
        WHEN net_salary =
             ROUND(gross_salary - pf_deduction - esi_deduction - pt_deduction, 2)
            THEN 'PASS'
        ELSE 'FAIL ⚠'
    END                                                      AS reconciliation_status
FROM EmployeePayroll
ORDER BY reconciliation_status DESC, employee_id ASC;


-- -------------------------------------------------------------
-- QUERY 5: Compliance Audit Summary Report
--   High-level pass/fail counts per payroll month
--   Used by auditors to certify statutory compliance
-- -------------------------------------------------------------
SELECT
    DATE_FORMAT(ep.payroll_month, '%b %Y')           AS payroll_period,
    COUNT(*)                                          AS total_employees,
    SUM(CASE
            WHEN ROUND(LEAST(ep.basic_wage, sr.pf_wage_cap)
                 * sr.pf_percentage / 100, 2) = ep.pf_deduction
            THEN 1 ELSE 0
        END)                                          AS pf_pass,
    SUM(CASE
            WHEN (ep.gross_salary <= sr.esi_wage_limit
                  AND ROUND(ep.gross_salary * sr.esi_employee_pct / 100, 2) = ep.esi_deduction)
              OR (ep.gross_salary > sr.esi_wage_limit AND ep.esi_deduction = 0)
            THEN 1 ELSE 0
        END)                                          AS esi_pass,
    SUM(CASE
            WHEN ep.net_salary =
                 ROUND(ep.gross_salary - ep.pf_deduction
                       - ep.esi_deduction - ep.pt_deduction, 2)
            THEN 1 ELSE 0
        END)                                          AS net_salary_pass,
    CONCAT(
        ROUND(
            100.0 * SUM(CASE
                WHEN ROUND(LEAST(ep.basic_wage, sr.pf_wage_cap)
                     * sr.pf_percentage / 100, 2) = ep.pf_deduction
                THEN 1 ELSE 0 END) / COUNT(*), 1
        ), '%'
    )                                                 AS pf_compliance_rate
FROM EmployeePayroll ep
JOIN StatutoryRules sr ON ep.rule_id = sr.rule_id
GROUP BY DATE_FORMAT(ep.payroll_month, '%b %Y')
ORDER BY ep.payroll_month DESC;

# 30_BUILD_TASKS — maldives_table_booking_core (summary)

P0 Foundation
- T0.1 Choose stack/deploy/providers (Architect)
- T0.2 Scaffold BE + CI + tests harness (BE)
- T0.3 Scaffold FE + CI build (FE)
- T0.4 DB schema+migrations (BE)
- T0.5 Auth+RBAC middleware (BE)
- T0.6 AuditLog hooks (BE)
- T0.7 Feature flags store + guards (BE/FE)

P1 Tenant+Menu
- T1.1 Restaurant CRUD (superadmin) + isolation tests (BE)
- T1.2 Superadmin UI create tenant (FE)
- T1.3 Public restaurant landing (BE/FE)
- T1.4 Menu CRUD + publish (BE/FE)
- T1.5 PDF upload pipeline + scan/quarantine + signed URLs (BE)

P2 Availability+Reservations
- T2.1 Availability engine + unit tests (BE)
- T2.2 /availability endpoints + admin UI (BE/FE)
- T2.3 /reservations create/cancel + Idempotency-Key (BE)
- T2.4 Guest booking flow UI (FE)
- T2.5 Admin booking mgmt UI (FE)
- T2.6 Isolation + overbooking integration tests (BE/QA)

P3 Notifications+Hardening
- T3.1 Email notifications (BE)
- T3.2 SMS optional behind flag (BE)
- T3.3 Rate limit + upload security checks (BE)
- T3.4 Logs/metrics basics (BE)

P4 Release
- T4.1 E2E suite: smoke+isolation+overbooking (QA)
- T4.2 Runbook complete (All)
- T4.3 Review PASS (Reviewer)

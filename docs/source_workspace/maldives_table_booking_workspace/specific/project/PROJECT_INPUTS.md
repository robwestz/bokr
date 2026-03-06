# PROJECT_INPUTS — maldives_table_booking_core

Purpose: Multi-tenant restaurangbokning (Maldiverna).

DoD (V1):
- guest booking + confirm
- admin sittningar/kapacitet + booking mgmt
- menu (text + PDF)
- tenant isolation + RBAC + audit
- smoke + e2e passerar
- runbook build/test/deploy/rollback

ASSUMPTIONS (verify in planning):
- Web platform
- REST API + Postgres
- Cloud deploy (PaaS)
- Email notifications required; SMS optional

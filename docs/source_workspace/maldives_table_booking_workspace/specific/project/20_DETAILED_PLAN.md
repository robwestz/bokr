# 20_DETAILED_PLAN — maldives_table_booking_core

## Macro brief
PURPOSE: multi-tenant restaurangbokning (Maldiverna). DoD: booking+admin+menu+notify+isolation+audit+e2e+runbook. CONSTRAINTS: no payments/ordering V1; timezone correct; safe uploads; no hallucinations.

## Decisions (verify early)
- Platform: Web (ASSUMPTION)
- DB: Postgres (ASSUMPTION)
- API: REST (ASSUMPTION)
- Deploy: Cloud PaaS (ASSUMPTION)
- Guest verify: email vs SMS (DECISION)

## Module plan (trace to MINIMAX)
1) Auth/RBAC/Audit ([B*][G1])
2) Tenant mgmt ([B1][D1][D2])
3) Restaurant landing + menu (+ PDF pipeline) ([C4][D3][J8])
4) Availability engine ([C5][D4])
5) Reservation engine + idempotency + concurrency ([D6][G3][J7])
6) Admin booking mgmt ([C9])
7) Notifications (email req; sms optional) ([C10])

## Phases
- P0 Foundation: repo scaffold + CI + DB migrations + auth skeleton + feature flags.
- P1 Tenant + menu (text+PDF) + public landing.
- P2 Availability + reservations + admin calendar.
- P3 Notifications + security hardening + observability.
- P4 E2E + runbook + review PASS.

## Change control
All scope add → Change Request; architecture changes need Architect+Planner Lead.

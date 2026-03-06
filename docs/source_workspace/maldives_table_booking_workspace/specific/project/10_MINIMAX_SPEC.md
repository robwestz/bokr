# 10_MINIMAX_SPEC — maldives_table_booking_core (A–K)

## A) Scope Lock
- [A1] In-scope: multi-tenant booking, meny (text+PDF), sittningar, simple capacity, publik bokningssida.
- [A2] Out-of-scope V1: payments/ordering, bundles, delivery.
- [A4] V1 DoD: booking+admin+menu+notifieringar+isolation+audit+e2e-smoke.

## B) Roles
- [B1] Superadmin: tenant CRUD, feature flags, support-mode + audit.
- [B2] Restaurangadmin: profil, meny, sittningar, bokningar.
- [B3] Gäst: browse, view menu, book/cancel.

## C) Modules
- [C4] Menu builder + PDF upload
- [C5] Availability engine
- [C8] Guest booking flow
- [C9] Admin booking mgmt
- [C10] Notifications

## D) Data (core)
- [D1] Restaurant/Tenant (+ timezone)
- [D2] User + Membership(role)
- [D3] Menu
- [D4] Sitting/CapacityRule
- [D6] Reservation (+ idempotency)
- [D7] AuditLog

## G) NFR
- [G1] Security/RBAC/isolation/audit
- [G3] Reliability: idempotent booking + concurrency control
- [G4] Observability basics

## J) Tests
- [J1] Smoke E2E
- [J6] Isolation test
- [J7] Overbooking test
- [J8] PDF security test

## K) Blockers
- [K4] Deploy target choice
- [K8] Email vs SMS verify for guest

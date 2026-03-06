# 40_ACCEPTANCE_TESTS — maldives_table_booking_core

Acceptance (V1)
- AC1 tenant create + admin login
- AC2 public landing shows published menu (text/PDF)
- AC3 sittings/capacity config works
- AC4 guest can book + confirm notification
- AC5 admin can view/edit/cancel; audited
- AC6 tenant isolation UI+API
- AC7 no overbooking under concurrency
- AC8 runbook build/test/deploy/rollback exists

Tests
- E2E Smoke: tenant→menu→sitting→book→admin view→cancel→notify
- E2E Isolation: tenant A cannot read B
- Concurrency: two parallel bookings same slot → one success
- Upload security: PDF scanning/quarantine + signed URL expiry
- Unit: availability rules + reservation state machine + RBAC
- Security checklist: rate limiting, secrets, audit coverage

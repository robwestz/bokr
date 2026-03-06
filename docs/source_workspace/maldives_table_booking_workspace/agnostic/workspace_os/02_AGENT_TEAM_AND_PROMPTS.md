# 02_AGENT_TEAM_AND_PROMPTS — Roles + subagent format (agnostic)

## Roles
- Planner Lead (dyr): äger 20/30/40 + traceability.
- Architect (dyr): arkitektur, kontrakt, NFR.
- Subagents (billiga): moduler, edge cases, testmatriser, risklistor.
- Builders (mix): implementerar tasks; uppdaterar runbook.
- Reviewer/QA (dyr): gatekeeper.

## Subagent output schema (copy/paste)
1) Summary (1–2 rader)
2) Entities (≤10)
3) APIs/Interactions (≤10)
4) Edge cases (≤10)
5) Tests (≤10)
6) Risks/ASSUMPTIONS (+ verify)

Merge rule: avvisa output utan tests eller tenant-isolation-notes.

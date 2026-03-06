# 01_WORKSPACE_RULES — Global rules (agnostic)

- Ingen scope drift: nya features → backlog tills explicit beslut.
- Inga externa fakta utan källa: använd ASSUMPTION + verifieringssteg.
- Traceability krävs: krav → tasks → tests.
- Macro brief måste följa med i alla subagent-uppdrag.
- Security baseline när auth/admin/PII/multi-tenant finns.

Drift reset: stoppa → återställ macro brief → skriv om i I/O + testbar form → re-run gates.

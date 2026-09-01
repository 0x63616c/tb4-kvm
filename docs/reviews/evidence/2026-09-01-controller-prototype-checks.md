# Controller prototype verification evidence

Date: 2026-09-01

Executor: primary agent (`/root`)

## Mandatory repository gate

Command: `npm run check`

Result: **PASS** (exit 0)

Material controller results:

- JavaScript controller model: 57 checks passed.
- Portable C controller core: 113 checks passed with the host C11 compiler and
  warnings treated as errors.
- Controller bench inventory: three candidates validated.
- Physical evidence example: `DRAFT`, thirteen cases, all unrun cases marked
  `BLOCKED`.
- Evidence adversarial suite: twenty false-completion mutants rejected,
  including semantically wrong evidence kinds for a required B-case.
- Repository evidence ledger: 29 records validated.
- Link check: 71 Markdown files and the interactive page passed.
- Dependency audit: zero vulnerabilities at the configured high threshold.
- Production build: passed.

The full gate also passed formatting, lint, TypeScript checking, the architectural
control model, PCB-1A plan, channel-budget contract, collateral policy, product
decisions, measurement-route inventory and SBOM generation. The proposed
validation-tool inventory also passed its structural validator.

## Local interactive-browser scenarios

Route: `http://localhost:3000/#controller-prototype`

Executor: primary agent (`/root`)

- Default startup selected Host A.
- Removing selected Host A entered `WAIT_BUTTON_A`; it did not select B.
- Requesting Host B entered `AWAIT_EJECT_B`; confirming selected B.
- Power loss entered `POWER_LOSS`; startup remained denied until power was
  restored, after which explicit startup selected the available host.
- Fault followed by brownout, restore and startup remained `FAULT_LATCHED`.

These are local UI/model integration observations, not physical, electrical,
USB-C, USB4 or Thunderbolt evidence. Exact-head live Pages verification is a
separate post-push gate.

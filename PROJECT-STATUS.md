# Project status

Last updated: 2026-09-01

This file is the durable pickup ledger. GitHub Issues is authoritative for live ticket state and dependency edges; this document records what is happening, why it is the next safe step and how another agent should continue without relying on chat history.

## Phase

Pre-PCB design review. The full project goal remains active. Work is not blocked, and no PCB is yet claimed order-ready.

## Locked decisions

- Thunderbolt 4, not Thunderbolt 5, for v1.
- Two upstream computers, one selected at a time.
- One physical button; no software required on the locked-down work computer.
- A small always-on controller and optional local display.
- Open source documentation, firmware, PCB and mechanical interface wherever vendor licensing permits.
- No PCB layout before the research package is reviewed.

## Recommended but not yet approved

- One TB4 accessory router with selectable upstream front end.
- One downstream TB4 port connected to the existing dock.
- Selected host receives up to 60 W; unselected host is electrically detached and unpowered.
- Separate low-speed display/button daughterboard to keep its wiring away from TB4 traces.
- One signal/control proof followed by one integrated board and one correction revision.

## Open gates

- Intel reference design, controller firmware/NVM and certification path.
- Exact power-supply budget and whether 60 W selected-host charging is sufficient.
- Exact downstream behavior with the existing OWC dock and target display.
- S-parameter channel simulation and fabricator stack-up.
- Final connector, ESD, mux and PD-controller companion parts.
- Patent/legal review before any commercial sale, especially for dual-controller resource-switching alternatives.

The authoritative close criteria for these gates are tracked in [Design-readiness checklist](docs/DESIGN-READINESS-CHECKLIST.md). Signal responsibilities are fixed at the pre-schematic level in [Signal and power ownership](docs/SIGNAL-POWER-OWNERSHIP.md). Mechanical work is limited to the interface rules in [Mechanical interface guidance](docs/MECHANICAL-INTERFACE.md) until a measured integrated board exists.

## Reported baseline requiring recapture

On 2026-09-01, `system_profiler SPThunderboltDataType` was reported to show the connected OWC Thunderbolt Dock 96W in USB4 mode at 40 Gb/s. The raw sanitized command capture, exact host/cable context and immutable evidence record were not retained in this repository, so the ledger deliberately downgrades this to `PROPOSED`. Re-run the documented baseline capture before using it as measured evidence. Even after recapture it will be a functional baseline, not electrical compliance.

## Current execution checkpoint

The execution map and repository operating rules are complete and independently reviewed. The immediate checkpoint is to publish this exact tree to `main`, verify exact-head CI/Pages and materialize the usual `ghq` checkout before agents resolve implementation tickets.

Why this comes first: the design contains high-speed channel, Type-C/PD, power-domain, fabrication, equipment-safety and physical-measurement gates. A reviewed graph prevents agents from designing or ordering later artifacts before their evidence and owner-authority prerequisites exist.

Latest evidence:

- Canonical live map: [GitHub issue #2](https://github.com/0x63616c/tb4-kvm/issues/2).
- Map audit: [`docs/reviews/2026-09-01-execution-map-audit.md`](docs/reviews/2026-09-01-execution-map-audit.md).
- Live API audit after dispositions: 53 child issues (#3–#55), 113 dependency edges, no cycles.
- Cost-aware agent routing: [`docs/agents/AGENT-SELECTION.md`](docs/agents/AGENT-SELECTION.md).

## Current frontier

Agent-ready, safely parallel research:

- #4 PCB-1A channel-budget method and schema;
- #5 accepted PCB-1A models and sourcing evidence;
- #6 measurement-route qualification;
- #19 router and Type-C/PD reference evidence;
- #22 early open-source collateral policy.

Owner participation or acceptance:

- #3 v1 product behavior and success envelope;
- #7 PCBWay pre-layout construction/capability inquiry;
- #52 pre-KVM desk baseline capture.

## Agent-routing decision

Use fast/lower-cost agents for bounded frontier research and issue hygiene. Use balanced agents for substantive PCB, firmware, CAD and site implementation. Reserve frontier reviewers for accepted architecture, power/PD safety, signal integrity, immutable manufacturing releases, firmware safety, physical CAD release and final v1 validation.

## Exact next pickup

1. Claim only unblocked issues. Resolve the independent research frontier in parallel without multiple agents duplicating the same broad work.
2. Persist primary-source evidence and independent review before closing each issue and unlocking PCB-1A topology.
3. Ask the owner only for actions that genuinely require them: product-envelope acceptance, vendor contact/approval, purchasing, equipment connection and physical measurements.

## Execution limits

- Research is not a compliance result.
- PCB CAD, simulation and DFM artifacts do not yet exist for an orderable revision.
- Physical fabrication, VNA/TDR measurement and compatibility evidence necessarily occur after owner-approved orders and receipt.
- No agent may purchase, accept a quote, submit fabrication or expose valuable equipment without the mapped owner gate.

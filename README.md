# TB4 KVM Field Guide

This repository is the pre-PCB research and learning package for a two-host, one-dock Thunderbolt 4 KVM.

The full living execution roadmap is in [End-to-end project plan](docs/PROJECT-PLAN.md). Product behavior is controlled by [Product requirements](docs/PRODUCT-REQUIREMENTS.md), and no artifact can be released outside the [Review and release policy](docs/REVIEW-AND-RELEASE-POLICY.md).

The integrated product is intentionally held at the design-review gate. Independent review selected a measurement-only mux coupon as PCB-1A, but even that coupon is not order-ready until an adequately ported calibrated VNA/equivalent mixed-mode S-parameter method, supplemental TDR/TDT plan, and frozen fabricator stack-up are agreed. No production schematic, integrated PCB layout, enclosure dimensions, or Thunderbolt product claims are approved yet.

## Current conclusion

Build a small, self-powered Thunderbolt 4 KVM dock with two selectable upstream host ports, one real Thunderbolt router, and at least one downstream Thunderbolt port. Do not treat a passive three-receptacle mux as the product architecture.

```text
Host A USB-C ── PD/CC A ──┐
                          ├── 4-pair high-speed mux ── TB4 router ── downstream TB4 ── dock
Host B USB-C ── PD/CC B ──┘                │
                                           ├── USB2/SBU routing
                                           └── MCU + display + protected power
```

The nearest shipping precedent is the Sabrent SB-TB4K / SSI SI-452TB4 architecture: a selectable front end feeding one Intel JHL8440 router. This validates the broad design pattern but not our final component set or layout.

## Review order

1. Work through the interactive field guide.
2. Read [Architecture decision](docs/ARCHITECTURE-DECISION.md).
3. Review [Signal and power ownership](docs/SIGNAL-POWER-OWNERSHIP.md).
4. Step through the [Controller and display state model](docs/CONTROL-STATE-MACHINE.md).
5. Review [Candidate parts](docs/CANDIDATE-PARTS.md).
6. Review [Validation plan](docs/VALIDATION-PLAN.md).
7. Review [Mechanical interface guidance](docs/MECHANICAL-INTERFACE.md).
8. Use the [Design-readiness checklist](docs/DESIGN-READINESS-CHECKLIST.md) to approve or change the v1 scope before schematic capture.

The machine-readable [evidence ledger](evidence/ledger.json) is authoritative for project status; the [Objective and evidence matrix](docs/OBJECTIVE-EVIDENCE-MATRIX.md) explains the distinction between completed research, intentionally gated work and missing physical validation.

The first fabrication scope is deliberately tracked in [PCB 1 definition](docs/PCB-1-DEFINITION.md) until vendor access, measurement capability and independent review determine which experiment most efficiently retires risk.

## Hard gates before PCB layout

- Obtain Intel Thunderbolt developer/reference-design access for the current JHL9440-family solution or Intel-recommended successor.
- Confirm a reproducible NVM/firmware and prototype-quantity sourcing path.
- Confirm Infineon CYPD5235/CCG5 upstream-dock firmware and programming workflow.
- Simulate the proposed connector–ESD–mux–router channel using vendor S-parameter models and the real PCB stack-up.
- Choose the product power policy: selected host only at 60 W is the recommended v1.
- Confirm that connecting the existing dock downstream meets the desired display/peripheral behavior even though its laptop-charging power will not transparently pass through the KVM router.

## What the display can show

The local MCU can truthfully show selected host, attachment/orientation, PD contract, measured voltage/current/power, faults, switching stage, reconnect time, temperature, and firmware version. It cannot passively count Thunderbolt bytes. True link speed requires supported router status or host-side confirmation; live throughput requires router counters, an analyzer, or a host helper.

## Status

The interactive site, documentation, v3 architectural control model and initial independent audits exist. `npm run check` verifies formatting, lint, TypeScript, the control-model invariants, evidence-ledger references and a production build. The ledger remains deliberately blocker-heavy, including Intel collateral, downstream PD ownership, host-availability policy, lab access and PCBWay's job-specific stack-up/DFM.

Read the append-only [independent review records](docs/reviews/README.md), [PCB-1 decision](docs/PCB-1-DEFINITION.md) and [parametric CAD release contract](docs/CAD-RELEASE-CONTRACT.md) before changing scope.

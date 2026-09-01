# Project goal

Build, test and document a working open-source two-host/one-dock Thunderbolt 4
KVM, then prepare a reviewed PCB order package. Keep moving with parallel agents
unless owner authority is genuinely required.

## Complete means

- The accepted v1 behaviour is implemented: Host A startup preference, explicit
  physical switching, no automatic failover, truthful status, isolated power
  loss and the named OWC Thunderbolt Dock 96W as the first compatibility target.
- The architecture, Type-C/PD power ownership and component choices are backed
  by permitted reference evidence; unknowns stay explicit.
- Schematics and PCB layouts pass automated checks and independent electrical,
  power/PD, signal-integrity, DFM and exact-release review.
- A revisioned PCBWay-ready fabrication/assembly package exists with BOM,
  placement, stack-up/impedance requirements, source hashes and an owner-facing
  order checklist. Preparing it does not authorize purchase or submission.
- Firmware/control behavior is tested first in a PD-free simulator and isolated
  low-value bench, then revision-bound to the integrated hardware.
- Parametric enclosure, desk-mount and remote-pod sources and exports are tied
  to measured PCB datums and pass model, mesh, slicer and physical-fit checks.
- Bring-up, functional, fault, compatibility and regression evidence is retained
  by hardware revision; correction boards are expected when evidence requires
  them.
- The repository and GitHub Pages contain beginner-friendly explanations,
  diagrams, interactive viewers, build/order/test/troubleshooting guides and
  honest evidence status.
- `main` is clean and pushed; full checks, independent exact-tree review,
  exact-head CI/Pages and live-result verification pass.

## Operating rules

- Use bounded, cost-aware parallel agents: balanced implementers for substantive
  work and independent stronger review at safety, SI, manufacturing and release
  gates.
- Persist decisions, evidence and exact pickup state in the repository; GitHub
  Issues owns the dependency graph and `PROJECT-STATUS.md` owns the current
  execution checkpoint.
- Do not pause for optional feedback. Adopt reviewed reversible choices as
  provisional defaults and continue unaffected work.
- Stop only for genuine owner authority: purchases, vendor contact/terms,
  fabrication submission, valuable-equipment exposure or an irreversible
  product decision.
- Never claim compliance, safety, order readiness, 40 Gb/s reliability or
  physical validation beyond the recorded evidence.

## Current checkpoint

Follow [`PROJECT-STATUS.md`](PROJECT-STATUS.md) for the live frontier and exact
next action. This file defines destination and completion, not current progress.

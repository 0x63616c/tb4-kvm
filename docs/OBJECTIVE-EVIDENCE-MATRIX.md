# Objective and evidence matrix

This file prevents partial documentation from being mistaken for a finished, validated KVM. Status is based on inspectable project artifacts or measurements, not intent.

| Required outcome | Current status | Authoritative evidence now | Evidence still required for completion |
|---|---|---|---|
| Beginner explanation of USB-C, USB4 and TB4 terminology | **Substantially complete** | Interactive pin map, differential-pair view, negotiation stepper, packet-tunnel view and glossary in `app/field-guide.tsx` | Reader review for unclear concepts and corrections against any newly obtained controller documentation |
| Researched two-host/one-dock architecture | **Conditionally accepted; integrated gate closed** | `docs/ARCHITECTURE-DECISION.md`, commercial precedent and independent architecture review | Intel confirmation of selectable-upstream topology plus a supported downstream CC/PD/VBUS design |
| Candidate parts and functional decomposition | **Provisional research only; release BOM absent** | `docs/CANDIDATE-PARTS.md` and `docs/SIGNAL-POWER-OWNERSHIP.md` | Reference-approved cross-vendor combination, exact MPNs, lifecycle/source evidence and firmware/programming path |
| Small powered controller/display concept | **Architectural model v3; rejected as firmware input** | Independent source/route/discharge command/readback model, explicit fault/timeout edges, guarded phase ordering and executable checks in `design/` and `scripts/` | Startup/availability policy, vendor-specific commands/thresholds/timers, downstream policy, implementation and hardware fault-injection results |
| PCB design files | **Not started by explicit review gate** | Absence is intentional and recorded in `PROJECT-STATUS.md` | Reviewed schematic, constraints, layout, fabrication files, assembly files and independently verified design checks |
| 40 Gb/s signal integrity | **Not validated for proposed hardware** | Existing OWC baseline reports USB4 at 40 Gb/s; validation ladder exists | Simulated and measured prototype channel, repeated functional traffic matrix, pre-compliance and lab results |
| USB-C PD and host-power safety | **Incomplete; downstream owner is a P0 blocker** | Corrected upstream ownership matrix, v3 state-model checks and independent review | Reference-derived upstream/downstream power schematic, independent safety review, PD traces, discharge/backfeed/fault measurements |
| Enclosure and mount interface guidance | **Pre-layout contract complete** | `docs/MECHANICAL-INTERFACE.md` defines datums, modular layers, thermal and cable-load evidence | Stable PCB STEP, measured thermal map, parametric CAD, rendered/imported artifacts and physical fit test |
| Independent review evidence | **Initial audits complete; blocking findings open** | Immutable reports under `docs/reviews/` plus dispositions in `docs/INDEPENDENT-REVIEWS.md` | Re-review corrected model/docs, then later schematic/layout/manufacturing/CAD reviews |
| Open-source reproducibility | **Policy incomplete** | Project documents distinguish public evidence from vendor-access gates | Chosen hardware/software/documentation licenses, redistributable-source audit, clean-room boundary for confidential collateral and reproducible toolchain |
| Product validation | **Plan only** | `docs/VALIDATION-PLAN.md`; current-dock baseline is reported but raw recapture is required | Sanitized baseline capture plus Rev A/Rev B hardware results, logs, fixtures, pass/fail thresholds and certification/interoperability evidence |

## Completion rule

The project objective is not complete while any row marked “not started,” “unvalidated,” “pending” or “plan only” lacks its stated evidence. In particular, a successful web build, operating MCU simulator or macOS `40 Gb/s` report cannot stand in for PCB, PD-safety or USB4 electrical validation.

## Next allowed evidence

Before the integrated architecture gate can open, useful evidence is limited to:

- corrected and independently reviewed documentation;
- vendor program/access outcomes;
- exact current-source and lifecycle records;
- supported evaluation-board experiments that cannot cross-connect host power;
- channel-model inputs and a fabricator stack-up proposal;
- test-fixture and logging specifications;
- explicit product-behavior and licensing decisions.

Integrated schematic capture, PCB outline selection and enclosure geometry remain outside the current authorization boundary.

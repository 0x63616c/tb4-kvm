# End-to-end project plan

Live ticket state, blocking edges and agent ownership are tracked in the [execution map](EXECUTION-MAP.md) and its canonical [GitHub wayfinding map](https://github.com/0x63616c/tb4-kvm/issues/2). This document remains the stage-level design plan.

## Outcome

Create a reproducible, open-source Thunderbolt 4 KVM that switches one existing TB4 dock between two computers with one physical action, preserves a real 40 Gb/s link, charges the selected host under an explicitly approved policy, and requires no host software.

The finished main unit is intentionally minimal:

```text
Host A TB4   Host B TB4   Dock TB4   DC power   Remote-control expansion
     \           |          /          |                 /
      └────────── minimal KVM enclosure ────────────────┘
                  onboard A/B button + status
```

The optional remote button/display pod and mount are separate low-speed mechanical products. Their interface is planned into the electronics; their final form is not allowed to delay or destabilize the first functional KVM.

## Phase 0 — product alignment

### Work

- Lock the minimal external interface.
- Record single-host, dual-host, absent-host and recovery behavior.
- Decide selected-host charging target and unselected-host policy.
- Define required display, storage, USB, Ethernet, sleep/wake and switch behavior.
- Record v1 exclusions.

### Deliverables

- `docs/PRODUCT-REQUIREMENTS.md`
- architecture decision records
- glossary and interactive beginner guide

### Exit evidence

Owner-approved requirements with no contradictory product behavior.

## Phase 1 — repository and governance

### Work

- Create and push the public GitHub repository.
- Establish directory structure, licenses decision, agent rules and review policy.
- Import existing research with sources and evidence labels.
- Make the interactive website the visual front door to the project.
- Add reproducible checks and artifact manifests.

### Exit evidence

Clean clone builds the site and runs all current tests; repository contains no credentials or confidential vendor documents.

## Phase 2 — vendor and feasibility gate

### Work

- Obtain Intel developer/reference-design access for the supported current accessory controller.
- Confirm legal firmware/NVM, programming/recovery and prototype sourcing paths.
- Confirm supported Infineon or alternative PD-controller implementation.
- Resolve the downstream self-powered dock's independent CC, data-role, power-role, VBUS and VCONN policy.
- Obtain exact package, connector, mux, ESD and via models.
- Obtain PCBWay or alternate fabricator stack-up, material and impedance-test proposal before routing.
- Define what vendor-gated material can be used but not redistributed.

### No-go conditions

- No legal reproducible firmware path.
- No sourceable controller in prototype quantity.
- No supported two-upstream selection architecture.
- No safe downstream dock power-role policy.
- No usable channel models or reference constraints.

## Phase 3 — virtual engineering

### Electronics

- Reference-derived block and page architecture.
- Three-port signal/power ownership matrix.
- Power tree, budgets, sequencing, fault tree and thermal estimates.
- Command/readback-separated control state machine with failure injection.
- Exact candidate BOM with lifecycle and sourcing evidence.

### Signal integrity

- Fabricator stack-up selected first.
- End-to-end S-parameter channel model for both host branches.
- Connector, ESD, mux, package, trace and via discontinuities included.
- Unselected-branch stub and orientation mapping included.
- Accepted limits come from the supported reference design, never inference.

### Mechanical

- Connector and PCB datum contract only.
- Exact vendor STEP models and cable-overmold clearance envelopes.
- No production enclosure geometry yet.

### Automated gates

- Schematic ERC.
- Reference-design diff/checklist.
- Power simulations and fault cases.
- Control-state transition tests and rejected-unsafe mutation tests.
- PCB DRC/DFM rules once layout begins.
- BOM completeness/source checks.
- Generated-artifact manifest and reproducibility checks.

## Phase 4 — PCB 1 engineering validation vehicle

PCB 1 is defined in a separate decision record after vendor access and independent review. It is an experiment with explicit questions, not a cosmetically incomplete product.

Candidate scopes:

1. High-speed channel/mux coupon plus calibration structures.
2. Low-speed PD/power/control evaluation board, used only with supported controllers/reference hardware.
3. Minimal integrated router validation board if vendor collateral eliminates the value of separate coupons.

Every included circuit must map to a named question, test method, pass/fail threshold and follow-on decision. PCB-1A may be designed and retained as an optional RF diagnostic without delaying the first integrated prototype. Fabricating or booking paid RF measurement is triggered only when its expected diagnostic value justifies the time/cost, or before stronger electrical-performance claims.

### Pre-order release gate

- Owner-approved PCB-1 definition.
- Zero unexplained ERC/DRC/DFM violations.
- Passing model/simulation with input provenance.
- Complete orderable BOM or identified consigned components.
- Independent electronics, SI, PCB and manufacturing review closed.
- PCBWay engineering confirmation of stack-up, impedance, BGA and inspection requirements.
- Gerber/drill/IPC-356/BOM/placement/drawing files independently inspected.
- Release manifest and plain-English risk report.
- No purchase without explicit owner approval.

## Phase 5 — optional engineering-vehicle fabrication and bring-up

This phase is not a hard predecessor of the first integrated prototype. The PD-free controller proof should run early using affordable equipment. PCB-1A fabrication/measurement may run in parallel or later when needed for diagnosis/model correlation.

### Incoming inspection

- Confirm revision, quantities and fabrication certificate/report.
- Inspect bare boards and assembly photographs.
- Obtain and review BGA X-rays where applicable.
- Validate impedance-coupon result if ordered.
- Check component identities and orientations.

### Safe power-up

- Resistance/short checks before power.
- Current-limited rail-by-rail power-up.
- Validate reset defaults and always-on control supply.
- Program and recover every programmable component.
- Confirm hardware protection acts without supervisor firmware.

### Functional evidence

- PD attach/orientation/contracts and detach/discharge traces.
- No cross-host or downstream-to-host unintended VBUS path.
- Both host branches and all cable orientations.
- Signal measurements and/or 40 Gb/s functional link evidence appropriate to PCB-1 scope.
- Raw logs, photos, instrument configuration and failures committed to `docs/validation/results/`.

## Phase 6 — first integrated minimal KVM prototype

Use accepted reference evidence, modeled channel constraints, the PD-free controller proof and protected power/PD evidence to create the first complete daily-use electrical prototype. Measured PCB-1A evidence improves confidence but is not required for the first order:

- Host A and Host B TB4 receptacles.
- One real downstream TB4 receptacle for the existing dock.
- External power and approved selected-host charging.
- Onboard switch and minimal status indication.
- Protected low-speed remote-control expansion port.
- Debug access only for safe low-speed signals.
- No redundant dock peripherals.

Repeat the full virtual, independent-review and manufacturing-release gates before ordering.

The design target is deliberately narrow: the owner's two target hosts, existing OWC dock, target display and known cables/peripherals. Revision A is an engineering prototype, not a compliance or universal-compatibility claim. Budget and plan for at least one correction revision.

## Phase 7 — integrated validation

### Required matrix

- Only Host A connected; only Host B connected; neither; both.
- Second host inserted without stealing the dock.
- Selected host removed with defined failover behavior.
- Button pressed toward an absent host.
- Every plug orientation on every port.
- Cold boot, warm boot, sleep, wake, logout and power loss.
- Existing OWC dock, target display, Ethernet, USB2, USB3 and PCIe storage.
- Concurrent display, network, USB and sustained storage traffic without switching.
- Normal switching only after the user has stopped or ejected external storage.
- Separately controlled destructive-fault switching during sustained storage writes only on disposable media/data, with recovery and integrity outcomes recorded.
- Multiple certified cable models/lengths.
- Fault injection, brownout, watchdog, failed discharge and wrong-port attachments.
- Thermal steady state, charging load and blocked-vent fault cases.
- At least 1,000 automated switching cycles.

OS-reported 40 Gb/s is functional evidence, not electrical compliance.

## Phase 8 — PCB 3 correction/release candidate

An expected measurement-driven revision, not a failure. Close every Rev B electrical, PD, SI, thermal, assembly and reliability finding. Repeat all gates and the complete validation matrix.

## Phase 9 — parametric enclosure, mount and control pod

Begin final mechanical design only after a PCB revision has a stable outline, connector datum set and measured thermal map.

### Source artifacts

- Parametric CAD source with named dimensions.
- PCB/connector STEP dependencies and licenses.
- Main enclosure, replaceable faceplates, tray and mount adapters.
- Optional button-only and display control pods.
- STEP, STL and 3MF exports plus deterministic regeneration scripts.

### Verification

- Independent source-model review.
- Mesh watertight/manifold/dimension checks.
- Bambu/target-slicer import proof.
- Declared orientation, supports, material and fasteners.
- Connector insertion, cable side-load, thermal and physical-fit tests.
- Printed iteration evidence before release.

## Phase 10 — open-source release and optional certification

- Reproducible hardware, firmware, CAD and website builds.
- Released BOM and approved alternates.
- Assembly, flashing, recovery, test and troubleshooting guides.
- Raw validation evidence and known limitations.
- License/redistribution audit separating open material from vendor-gated dependencies.
- Formal Thunderbolt/USB4 certification and commercial-sale work remain a separate, explicitly funded phase.

## Progress and review cadence

- Repository updated at each material decision or evidence milestone.
- Interactive website reflects repository state and links to source evidence.
- Non-sensitive milestone notifications sent to `ntfy.sh/0x63616c`.
- Independent agent review occurs before each state change from `PROPOSED` to `REVIEWED`, and again before any fabrication release.

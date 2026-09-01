# Beginner build and contribution guide

This guide starts with what is safe and reproducible today. Hardware sections unlock only when their evidence gates close. Do not order a board merely because a later section describes the intended workflow.

## 1. Run the project hub

Install Node.js 22 or newer, then:

```bash
git clone https://github.com/0x63616c/tb4-kvm.git
cd tb4-kvm
npm ci
npm run dev
```

Open `http://localhost:3000`. The site teaches USB-C contacts, USB4/TB4 negotiation, differential pairs, the mux/router architecture, control states, candidate parts and current evidence gates.

Run every repository check before proposing a change:

```bash
npm run check
```

## 2. Understand the status labels

`PROPOSED`, `MODELED`, `REVIEWED`, `FABRICATED`, `MEASURED`, `VALIDATED` and `BLOCKED` have exact meanings in [`AGENTS.md`](../AGENTS.md). A green software build never upgrades an electrical artifact to `MEASURED` or `VALIDATED`.

## 3. PCB-1A preparation—current stage

PCB-1A is not yet orderable. Work through:

1. [`PCB-1-DEFINITION.md`](PCB-1-DEFINITION.md) for scope;
2. [`PCB-1A-PARTS-EVIDENCE.md`](PCB-1A-PARTS-EVIDENCE.md) for exact candidate OPNs and vendor questions;
3. [`PCB-1A-MEASUREMENT-METHOD.md`](PCB-1A-MEASUREMENT-METHOD.md) for the VNA/de-embedding/evidence contract;
4. [`PCBWAY-PREQUOTE-INQUIRY.md`](PCBWAY-PREQUOTE-INQUIRY.md) for job-specific construction and DFM evidence;
5. [`DESIGN-READINESS-CHECKLIST.md`](DESIGN-READINESS-CHECKLIST.md) for the no-go gates.

No PCBWay message, upload, quote acceptance, payment or fabrication is authorized without the owner's explicit approval.

## 4. What the eventual PCB-1A guide must contain

Before ordering, this section must be replaced by a revision-specific release guide containing:

- exact Git commit and immutable hardware release directory;
- KiCad and tool versions;
- schematic/layout review IDs and disposition;
- exact BOM and sourcing snapshot;
- frozen stack-up, impedance table and PCBWay DFM response;
- Gerber/drill/netlist/position/manufacturing manifests with hashes;
- assembly options, orientation drawings, stencil and reflow constraints;
- RF fixture, loads, cabling, power/control and ESD handling;
- VNA calibration, state matrix, raw file naming and pass/fail procedure;
- known errata and the decision each measurement drives.

## 5. Controller/display prototype—parallel later guide

PCB-1B deliberately excludes USB-C, PD, VBUS and high-speed lanes. Its future guide must cover firmware toolchain, programming/recovery, button/remote connector pinout, display options, watchdog/brownout/fault injection and safe simulated outputs. It cannot claim attach, charging or TB4 validation.

## 6. Integrated KVM—blocked

Do not construct an integrated board from the high-level diagrams. It remains blocked on Intel/Infineon reference access, firmware/NVM, downstream power ownership, cross-vendor compatibility, a complete channel budget and safe Type-C/PD fault evidence.

When those gates close, the build guide will include assembly, programming, protected first power-up, PD analyzer/electronic-load tests, oscilloscope fault captures, host-free validation, laptop introduction, enumeration/peripheral tests, repeated switching, thermal testing and compatibility matrices.

## 7. Enclosure and 3D printing—blocked on proven geometry

Parametric CAD starts after PCB geometry and thermals stabilize. Every release will include source CAD, STEP, STL and 3MF; named parameters/datums; mesh and dimension checks; real slicer import; orientation/support notes; gauges; and physical fit evidence. See [`CAD-RELEASE-CONTRACT.md`](CAD-RELEASE-CONTRACT.md).

## 8. How to contribute safely

- Start from the repository's `main` branch and keep changes small and evidence-linked.
- Use manufacturer primary sources and date any availability/price snapshot.
- Add or update machine-readable evidence when changing a status claim.
- Run `npm run check` on the exact staged tree.
- Request independent domain review and persist it under `docs/reviews/` before pushing.
- Push directly to `main` for now; do not open a project pull request unless the owner changes the policy. After pushing, verify the Actions run matches the new `main` SHA.
- Never commit confidential vendor collateral, credentials or unsanitized machine data.
- Never order hardware on behalf of the owner.

## 9. Build the static GitHub Pages site

To reproduce the hosted field guide and revision-bound artifact hub locally:

```bash
VITE_GIT_COMMIT=$(git rev-parse HEAD) npm run build:pages
npm run preview:pages
```

Open `http://127.0.0.1:4173/tb4-kvm/`. The preview server deliberately mounts `dist/client` at the same `/tb4-kvm/` path used by GitHub Pages, so assets and the `/tb4-kvm/project/` hub are tested under their real base path. Stop it with `Ctrl-C`. The generated hub inventories repository documents and only exposes PCB/CAD viewers when real revisioned artifacts exist. See [`ARTIFACT-HUB-CONTRACT.md`](ARTIFACT-HUB-CONTRACT.md).

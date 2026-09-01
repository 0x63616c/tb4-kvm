# Review and release policy

## Principle

No artifact approves itself. Automated checks, author inspection and independent review are complementary and required in proportion to risk.

## Review gates

| Artifact | Automated evidence | Independent review | Release evidence |
|---|---|---|---|
| Requirements/architecture | contradiction/link checks where possible | product plus electrical safety review | owner approval and closed findings |
| Firmware/application code | lint, typecheck, unit/state/fault tests, build | code/spec/security review | exact commit and passing logs |
| Schematic | ERC, reference checklist, simulations | PD/power, controller and safety review | zero unexplained errors plus dispositions |
| PCB layout | DRC, parity, constraint and manufacturability checks | SI/return-path/layout review | stack-up-approved reports and renders |
| Manufacturing outputs | deterministic export, manifest hashes, Gerber drill/netlist checks | independent CAM/order-package review | immutable signed/tagged release folder |
| Parametric CAD | regeneration, dimension and mesh checks | datum/fit/printability review | source plus verified STEP/STL/3MF |
| Physical result | scripted bring-up and acceptance matrix | evidence/result review | raw logs/photos/instrument setup and decision |

## Finding severity

- `P0`: unsafe, invalid architecture, wrong claim, or certain release failure. Blocks all related work.
- `P1`: likely functional/reliability/reproducibility defect. Blocks fabrication/release.
- `P2`: material quality, documentation or maintainability gap. Must be resolved or explicitly accepted before release.
- `P3`: optional improvement; may remain recorded.

No P0/P1 finding may be waived solely to save time. Any accepted P2 requires owner-visible rationale and containment evidence.

## Fabrication release

Each release folder must contain:

- source commit and release identifier;
- schematic PDF and machine source;
- PCB source, Gerbers, drills, IPC-356/netlist where supported, placement and BOM;
- stack-up/impedance drawing and fabrication notes;
- assembly drawings and polarity/orientation aids;
- programming and functional-test instructions;
- automated check reports;
- independent review report and all dispositions;
- known risks and exact experiment/acceptance purpose;
- SHA-256 manifest for every order artifact.

The owner approves the exact immutable release. A later source change invalidates that approval until a new release is generated and reviewed.

## Physical and mechanical release

CAD exports are not released because they look plausible. Require:

- source parameters and dependencies;
- regenerated STEP/STL/3MF hashes;
- dimension/mesh validation;
- target slicer import and plate screenshot/report;
- print material, orientation, supports and fasteners;
- actual fit evidence against the identified PCB revision;
- independent CAD/print review.

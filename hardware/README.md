# Hardware workspace

This directory is the reserved home for hardware source and immutable release
evidence. The current project state is `BLOCKED`: no schematic, PCB, BOM,
fabrication output, or orderable hardware revision exists.

The scaffold is documentation and policy only. It intentionally contains no
KiCad electrical source. Do not infer nets, symbols, footprints, stack-up,
rules, parts, or order readiness from these files.

## Evidence boundary

Future electrical work must first close the Intel/Infineon reference, power and
PD safety, component/model, channel-simulation, and fabricator gates recorded
in the project documents. A real schematic or PCB source may be introduced
only with an identified revision and independent review plan.

Manufacturing releases belong only under [`releases/`](releases/README.md), in an
immutable revision directory with a manifest. Preparing a release never
authorizes a purchase or fabrication submission; the owner approves the exact
immutable package separately.

Run the structural policy check with:

```sh
npm run verify:hardware-scaffold
```

# KiCad source boundary

No KiCad schematic or PCB source has been authorized yet. This directory is a
revisioned source boundary and tool record, not an electrical design.

The local observation on 2026-09-01 is KiCad `10.0.4`, invoked explicitly as:

```text
/Applications/KiCad.app/Contents/MacOS/kicad-cli
```

The repository's documented CLI reference is KiCad `9.0.9` (see
`design/validation-tools/inventory.json`). The installed tool and documented
reference therefore differ. This scaffold makes no compatibility claim. A
future implementation must deliberately select and record its canonical
version before generating KiCad artifacts.

Do not add `.kicad_sch`, `.kicad_pcb`, symbol, footprint, netlist, BOM,
Gerber, drill, placement, stack-up, or manufacturing files here until the
design-readiness and independent-review gates close. ERC/DRC reports, when
there is a real source revision to check, must record the exact tool version,
configuration, source revision, exit status, and hashes.

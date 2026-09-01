# Parametric CAD release contract

Final enclosure geometry begins only after a released PCB outline, connector datums and measured thermal inputs exist. Provisional fixtures and gauges may be created earlier when clearly labeled.

## Evidence ladder

Every part advances through these states without skipping:

```text
source-authored
  → source-tested
  → exported
  → mesh-validated
  → slicer-imported
  → sliced
  → printed
  → physically-inspected
  → accepted
```

A render, successful export, slicer return code, submitted print or completed print proves only its own step.

## Source and artifact layout

```text
cad/
  parameters/
  src/
  tests/
  fixtures/
  profiles/
artifacts/<part>/<revision>/
  source/
  step/
  mesh/
  3mf/
  renders/
  slicer/
  inspection/
  manifest.json
```

## Required checks

- Named parameters for datums, wall thickness, clearances, tolerances, fasteners, cable corridors, connector protrusion and thermal assumptions.
- Revision-pinned PCB STEP and connector/cable models with redistribution status.
- Automated bounds, volume, units, part count, interference, keepout and minimum-wall checks.
- Reproducible STEP plus convenience STL/3MF exports containing real geometry.
- Watertight/manifold mesh, valid normals, no degenerate faces and bounded mesh deviation.
- Real import into the named slicer with printer, nozzle, material, layer height, orientation, supports, warnings, estimates and screenshots recorded.
- Physical gauges before full enclosure where connector/cable/insert uncertainty remains.
- Identified print revision, measured critical dimensions, real PCB/cable/fastener fit, insertion/removal, strain relief, load and thermal observations, photos and explicit accept/reject result.

Physical feedback must update named parameters and trigger regenerated artifacts plus re-review.

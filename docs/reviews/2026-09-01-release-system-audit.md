# Independent repository, code and release-system audit

- Date: 2026-09-01
- Reviewer role: independent software/release/CAD subagent
- Source state: pre-Git working tree
- Disposition: **not release-ready**

## P0 findings

- No canonical Git repository, governance, CI or release history existed.
- Lint and formatting gates were red and there was no composite check.
- Status was duplicated across prose and hard-coded JSX instead of a machine-readable ledger.
- No parametric CAD source/export/slicer/physical-fit contract existed.

## Required evidence system

Use stable IDs linking objective → requirement → decision → gate → test → evidence → artifact. A machine-readable ledger must be authoritative and the website should render it. Releases need exact hashes, tool versions, manifests, review dispositions and supersession history.

## CAD evidence ladder

`source-authored → source-tested → exported → mesh-validated → slicer-imported → sliced → printed → physically-inspected → accepted`

No render, successful export, slicer return code, submitted job or completed print may imply physical acceptance.

## Author response

- Governance and release documents were added.
- Unused UI scaffold files causing lint failures were removed.
- A composite check, CI workflow, evidence ledger and CAD release contract are being added before PCB/CAD artifacts.

These responses require CI and independent re-review before closure.

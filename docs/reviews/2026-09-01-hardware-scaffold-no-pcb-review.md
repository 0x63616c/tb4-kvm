# Hardware scaffold and no-PCB claim review

Date: 2026-09-01

Reviewer: independent hardware-scaffold reviewer with separate standards and
spec review

Reviewed implementation tree: `54d74121b9eac9ed8a965984382c1e04b4ca5bc6`

Final disposition: **ACCEPT after findings were resolved**

## Scope

The review covered the explicit site/README warning that no PCB exists, the
non-electrical `hardware/` release scaffold, its binding to real blocked ledger
gates, local/documented KiCad version facts, the absence of Pages exposure, and
the fail-closed validator and adversarial suite.

## Findings and dispositions

The first review found one P1: a filename blacklist missed legacy KiCad and
common manufacturing names, and deleted source/output fields could pass. The
implementation now permits exactly the four policy/scaffold files while status
is `BLOCKED`, requires the exact source and output key sets, and rejects 22
adversarial mutations. The reviewer independently reproduced rejection of
`.brd`, `.sch`, `.gtl`, `.gbl`, `.gko`, `drill.txt`, `order-package.zip`, and a
deleted source field.

The corrected implementation passed the full repository gate. A final P2
wording mismatch in `PROJECT-STATUS.md` was then corrected from 13 to 22
adversarial mutations.

## Claim boundary

This acceptance applies only to truthful project-state reporting and the
non-electrical release scaffold. It does not constitute a schematic review,
PCB layout review, signal-integrity result, fabrication release, Thunderbolt
certification, physical test, or order authorization. No KiCad schematic,
routed PCB, Gerber, BOM, assembled board, or order package exists.

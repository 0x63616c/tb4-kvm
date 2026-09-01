# Immutable hardware releases

This directory is reserved for immutable, revisioned manufacturing packages.
It currently contains no release. A future release directory must use a
stable name such as `rev-a` or `pcb-1a-r01` (lowercase letters, digits and
single hyphens only), and must not be renamed or overwritten after approval.

A release manifest must bind the release identifier and source commit to tool
versions, input/output hashes, check results, review dispositions, known risks,
and the exact experiment or acceptance purpose. A complete order package also
requires the source schematic/PCB, BOM, stack-up/impedance and fabrication
notes, manufacturing outputs, assembly aids, test instructions, automated
reports, and independent review. See
`docs/REVIEW-AND-RELEASE-POLICY.md` for the full gate.

No release directory or manifest here authorizes ordering, payment, quote
acceptance, or fabrication. The Pages artifact hub may expose hardware only
when a complete immutable release is deliberately indexed by its own contract;
this scaffold exposes nothing.

# Interactive project-hub contract

The website is the owner's single visual overview. Repository files remain authoritative; the site summarizes and links to their evidence.

## Required views

- Plain-English “what we are building” overview.
- Interactive USB-C/TB4 terminology and signal diagrams.
- End-to-end project roadmap and current phase.
- Product interface and single-host behavior.
- Architecture block diagram and decision history.
- Candidate/released BOM with evidence state and source links.
- PCB 1 questions, schematic/board renders, layer/route explanations and manufacturing status.
- Automated checks and independent review findings/dispositions.
- Bring-up instructions, test matrix and measured results.
- Revision comparison and known limitations.
- Parametric enclosure/control-pod viewer or downloadable source/STEP/STL/3MF links, print settings and fit evidence.
- Notifications/build-log timeline without secrets or private machine identifiers.

## Truth rules

- Every status label maps to a repository artifact and commit.
- Proposed diagrams are visibly different from released designs.
- A green check names the exact test and scope it proves.
- Missing, vendor-gated and failed evidence remains visible.
- PCB/CAD renders never imply fabrication or physical validation.
- No confidential vendor collateral is rendered or linked publicly.

## Build and review

- Site build, lint and internal-link checks run automatically.
- Code changes receive independent review.
- Electronics claims receive electrical review, even when the UI code is correct.
- Images/models include source, revision and evidence labels.

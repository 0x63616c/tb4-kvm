# Agent selection and review economy

Use the least expensive agent tier that can responsibly complete the bounded task. Parallelism is valuable only when tasks are independent and the expected evidence is clear.

## Fast/low-cost agents

Use for:

- bounded primary-source lookup and availability snapshots;
- link checking, inventories, manifests and repetitive documentation;
- isolated helper scripts with strong tests;
- mechanical export/check chores after parameters are frozen;
- issue hygiene and evidence formatting.

Give these agents narrow prompts, small context forks and exact output contracts. Do not ask several agents to independently repeat the same broad research.

## Balanced implementation agents

Use for:

- schematic or layout implementation from accepted constraints;
- firmware features with executable state/fault tests;
- substantive site/viewer work;
- parametric CAD source implementation;
- integration of several already-reviewed evidence inputs.

Split work by non-overlapping files or domain boundaries. One agent owns a shared PCB, firmware or CAD source at a time.

## Frontier independent reviewers

Reserve the strongest reasoning tier for checkpoints where a missed defect could waste a fabrication revision, damage equipment, create a false compliance claim or invalidate the release:

- architecture and reference-design acceptance;
- Type-C/PD/VBUS/VCONN and power-safety review;
- SI/channel-budget assumptions and final layout constraints;
- schematic/layout/manufacturing-release audit;
- firmware safety-state and fault-injection review;
- final CAD/print/fit release review;
- physical evidence, compatibility and final v1 claim audit.

Do not use a frontier reviewer as the implementation author. Review the exact immutable tree/release, record findings and dispositions, and rerun only after material changes.

## Token discipline

- Prefer one primary worker plus one independent reviewer over many duplicate workers.
- Reuse an agent already holding the relevant bounded context when appropriate.
- Use `fork_turns="none"` or a small recent-turn fork for isolated tasks.
- Persist research and decisions promptly so later agents read files instead of replaying long chat history.
- Stop agents when their bounded result is complete; do not leave speculative parallel work running behind blockers.

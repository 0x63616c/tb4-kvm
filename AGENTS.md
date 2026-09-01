# Agent operating rules

This repository is the source of truth for the open-source TB4 KVM project. Chat history, generated prose and agent confidence are not evidence unless the result is persisted and independently checkable here.

The durable destination and definition of done are in [`GOAL.md`](GOAL.md).
The live checkpoint and next action are in [`PROJECT-STATUS.md`](PROJECT-STATUS.md).

## Product boundary

The target is a minimal, externally powered, two-host/one-dock Thunderbolt 4 KVM with three TB4 receptacles, an onboard switch/status indicator and a protected low-speed expansion interface for a later remote control pod. It must work without host software. Do not add a general-purpose dock, extra display outputs, networking, USB-A ports or Thunderbolt 5 unless a recorded decision changes the scope.

## Safety and claims

- Never connect, or allow an uncontrolled state to connect, Host A VBUS to Host B VBUS.
- Treat upstream A, upstream B and downstream dock CC/PD/VBUS/VCONN as three separately owned port domains until an accepted reference design proves otherwise.
- Do not guess USB-C/PD timing, thresholds, router reset behavior, firmware registers, signal mapping or channel limits.
- A tool passing proves only what that tool checks. ERC/DRC does not prove USB4 signal integrity; OS enumeration does not prove compliance; a rendered model does not prove printable geometry or fit.
- Do not label a design order-ready while any release-blocking review finding, vendor-reference gate, unknown component source, simulation failure or waived manufacturing error remains.
- Do not place, pay for or authorize fabrication. Prepare an approval package for the owner.

## Evidence states

Use these labels consistently:

- `PROPOSED` — reasoned design requiring review.
- `MODELED` — checked in an identified simulation with inputs and limits recorded.
- `REVIEWED` — independently reviewed; findings and dispositions recorded.
- `FABRICATED` — physical artifact received and identified by revision.
- `MEASURED` — result from named equipment/procedure with raw evidence retained.
- `VALIDATED` — all documented acceptance criteria for the claim passed.
- `BLOCKED` — missing authority, source, model, equipment or external access prevents progress.

## Required review separation

The author of an artifact cannot be its only reviewer. Use independent agents for:

- application and firmware code;
- requirements and safety state machines;
- schematic and power/PD design;
- signal-integrity assumptions and PCB constraints;
- PCB layout, DFM and manufacturing outputs;
- parametric CAD, exported STEP/STL/3MF, slicer import and physical-fit evidence.

Record review inputs, findings, severity, disposition, author and evidence in `docs/reviews/`. Re-run the review after material changes.

## Primary-agent role

The primary agent acts as project lead, systems integrator and release owner—not as the default individual contributor for every artifact.

- Maintain the critical path, dependency graph, evidence state and owner-decision queue.
- Break work into bounded, non-overlapping tickets and delegate each to the least expensive capable agent.
- Give each worker an exact output contract, accepted inputs, file ownership and validation requirement.
- Prevent duplicate research and concurrent edits to shared PCB, firmware or CAD sources.
- Inspect and integrate agent work, resolve cross-domain conflicts, obtain independent review and verify exact-tree CI/Pages after delivery.
- Personally handle small coordination/glue changes, release operations and narrow gaps when delegation would cost more than the work.
- Escalate to the owner only for product choices, external contact/terms, purchases, fabrication submission, valuable-equipment exposure and physical evidence that requires them.
- Do not pause the project at an optional feedback checkpoint. When a reviewed
  choice is reversible and consistent with the accepted product boundary, adopt
  it as a clearly marked provisional default and continue the unblocked work.
  Ask the owner without stopping parallel progress; stop only when authority or
  an irreversible decision is genuinely required.
- Keep `PROJECT-STATUS.md` and the live issue map current so a future primary agent can resume from persisted evidence.

## Repository discipline

- Work toward `main` directly for now; do not open project pull requests unless the owner changes this policy. Before pushing, run the full repository gate and persist independent review of the exact staged tree. After pushing, verify GitHub Actions against the exact new `main` commit. Never force-push or delete `main`.
- Keep `PROJECT-STATUS.md` current at meaningful handoffs. Record what is being done, why it is the next safe step, the active/blocked/owner-only frontier, evidence produced, unresolved risks and the exact pickup action. Do not use chat history as the only continuity record.
- Existing project-wide canonical documents remain at `docs/*.md`; use `docs/decisions/`, `docs/research/` and `docs/validation/` for new multi-file domain records when those collections are created. Keep fabrication releases in immutable revision folders under `hardware/releases/`.
- Store source models, scripts and tool versions—not only exports.
- Never commit vendor-confidential collateral, credentials, tokens or personally identifying machine data. Record the document title/revision/access restriction instead.
- Every generated release must include a manifest with source commit, tool versions, input hashes, output hashes and check results.
- Use manufacturer part numbers and primary-source URLs. Mark distributor stock/price snapshots with their capture date.
- Keep the website synchronized with repository evidence; it is a visual index, not an independent source of truth.

## Parametric mechanical work

- Keep dimensions as named parameters tied to released PCB datums and connector STEP models.
- Do not freeze the production enclosure before the integrated PCB outline and thermal map are measured.
- Verify source-model regeneration, mesh validity, dimensions, slicer import, intended orientation/supports and physical fit before calling an export printable.
- Publish source CAD plus STEP and printable exports. A screenshot alone is not a deliverable.

## Progress notifications

The primary agent sends concise, non-sensitive milestones to `https://ntfy.sh/0x63616c`. Notifications must not include secrets, private document contents, machine identifiers or unverified success claims.

## Agent skills

### Issue tracker

Work breakdown, wayfinding maps and tickets live in this repository's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the canonical five-state triage vocabulary plus `wayfinder:*` map/type labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context project. Read `CONTEXT.md` and relevant records under `docs/` before changing domain terms or architecture. See `docs/agents/domain.md`.

### Agent selection and cost

Match agent capability to risk instead of defaulting every subtask to the most expensive model. The owner explicitly prefers token-conscious execution:

- use fast, lower-cost agents for bounded research, issue hygiene, documentation and repetitive checked work;
- use balanced agents for substantive PCB, firmware, CAD and website implementation;
- reserve frontier agents for independent reviews where an error could waste a board revision, damage equipment or support a false safety/compliance claim;
- normally use one worker plus one independent reviewer, not several agents repeating the same broad task;
- use small or empty context forks and make agents work from persisted repository evidence;
- do not trade away validation to save tokens: the final electrical-safety, signal-integrity, manufacturing-release and validated-v1 checkpoints require strong independent review.

See `docs/agents/AGENT-SELECTION.md` for the full routing policy.

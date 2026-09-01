# PCB-1A topology-contract correction review

- Date: 2026-09-01
- Artifact author: implementation agent (`/root/pico_firmware_frontier`)
- Correction reviewer: implementation agent (`/root/pico_firmware_frontier`),
  not used as the independent acceptance reviewer
- Independent reviewer: `/root/final_release_rereview`
- Review status: **ACCEPTED as a `PROPOSED` pre-schematic contract only**

## Scope and exact inputs

- `design/pcb1a/topology.contract.json`
- `design/pcb1a/topology.schema.json`
- `design/pcb1a/validate-topology.mjs`
- `design/pcb1a/topology.test.mjs`
- `design/pcb1a/README.md`
- `docs/PCB-1-DEFINITION.md`
- `design/pcb1a-measurement-matrix.json`
- `design/channel-budget/prototype-a-example.json`
- `design/parts-evidence/issue-5-inventory.json`
- `docs/PCB-1A-MEASUREMENT-METHOD.md`

## Findings and dispositions

| Severity | Finding | Disposition |
| --- | --- | --- |
| P1 | Branch roles, component-slot freeze/status fields, review gates, and free-form prose could drift while preserving superficial topology checks. | Resolved in the validator by exact-locking branch records, complete component-slot records, class-rule prose, blocked constraint fields, and every before-schematic/before-order/not-claimed gate; adversarial mutations cover each demonstrated bypass. |
| P1 | Treating four required fixture categories as exactly four physical instances contradicted the canonical method's per-materially-distinct-launch/escape 2x-through/plain-through requirement and omitted fitted/DNP DUT variants. | Resolved by replacing instances with four fixture classes. Their multiplicity rules are exact, but all physical instance counts remain `null` and `BLOCKED` until launch, ESD, lab, and stack-up freezes. |
| P1 | A four-port campaign did not explicitly account for all unmeasured conductors without changing selected/common termination. | Resolved with an exact one-host-to-common-path-at-a-time 4+8+12 rule at `CABLE_END`: four path P/N endpoints are measured; the state's eight-port inactive host bundle uses its selected matched/open kind; the remaining 12 selected-host/common conductors are matched. The validator derives a disjoint, exhaustive partition for all eight paths across the four applicable selected states. |
| P2 | A structural validator could be misconstrued as compliance, de-embedding, fabrication, or order evidence. | Retained as an explicit claim boundary: `status` is `PROPOSED`, `orderReady` is `false`, all product domains remain absent, and physical models, instance counts, stack-up, limits, layout, lab acceptance, and ordering remain blocked. |

## Evidence and commands

Run from the repository root:

```sh
npm run verify:pcb1a
node design/pcb1a/validate-topology.mjs
node design/pcb1a/topology.test.mjs
```

The mutation suite rejects branch-role drift, frozen-slot claims, missing review
gates, false compliance/order prose, shortened paths, contradictory isolation,
extra fixture classes, malformed campaigns, source/part drift, unsafe controls,
and invalid documents without throwing.

## Boundary retained

This review does not accept the topology as frozen or order-ready, close issue
#8, establish USB4/Thunderbolt compliance, select a component, create a
schematic/layout, count physical fixtures, book a lab, or authorize a purchase
or fabrication. It remains a `PROPOSED` RF-only contract; the final independent
source review below does not raise that electrical evidence state.

## Final independent acceptance

Reviewer `/root/final_release_rereview` accepted exact staged tree
`25e349a9b374f80e70b9367a8673a273270b2ddd`. It independently enumerated all 16
applicable path/state campaigns and confirmed every one is a disjoint,
exhaustive 4 measured + 8 inactive-bundle + 12 other matched partition. It also
confirmed the four fixture-class multiplicity rules, exact semantic locks, 29
executing adversarial mutations, `PROPOSED` ledger status and every no-order/
no-compliance boundary.

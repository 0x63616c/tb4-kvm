# Execution map

The canonical live work breakdown is the GitHub wayfinding map: [Wayfinder: deliver a working open-source TB4 KVM v1](https://github.com/0x63616c/tb4-kvm/issues/2).

It contains 53 named child tickets with native blocking relationships. GitHub Issues is authoritative for open/closed state, ownership and the current parallel frontier; this document explains the shape without duplicating that live state.

## Parallel work lanes

The safe early frontier has independent lanes for:

- PCB-1A channel allocation;
- exact mux/ESD models and prototype sourcing;
- lab/measurement-route qualification;
- owner-captured pre-KVM desk baseline;
- owner-authorized PCBWay pre-layout construction inquiry;
- router and Type-C/PD reference access;
- early open-source collateral rules.

These can progress concurrently because none edits a shared released PCB source. Each result closes a decision or supplies evidence that sharpens later work.

## Serialized hardware spine

The PCB-1A topology, schematic, layout, release-specific DFM, owner orders, receipt/assembly readiness, lab booking, measurement and correction convergence form a serialized evidence spine with safe procurement branches. The integrated schematic cannot freeze until the measured channel decision, controller prototype, reference route, redistribution audit and power-safety proof exist. Integrated layout/models, firmware/release, owner order, incoming inspection, bring-up, compatibility/pre-compliance and correction convergence follow their mapped gates.

Mechanical interface freeze waits for measured integrated hardware. Parametric enclosure/mount/pod design can then proceed in parallel with later compatibility work, but physical fit release waits for the final correction revision.

## Agent claiming rule

An agent may claim only an open, unassigned map child with no open blocker. It must persist its evidence in the repository, obtain the required independent review, comment the resolution with immutable links, close the ticket and add a one-line decision pointer to the map. Human-in-the-loop tickets remain unclaimed until the owner is participating or has granted the required external authority.

Agent selection is cost-tiered: fast/low-cost workers handle bounded research and mechanical/repetitive chores; balanced agents implement substantive PCB, firmware, site and CAD changes; strongest independent reviewers are reserved for safety, SI, manufacturing-release and final-validation gates. See [`docs/agents/AGENT-SELECTION.md`](agents/AGENT-SELECTION.md).

## Delivery policy

No pull requests for now. Each implementation slice is reviewed against its exact staged tree, rebased/fast-forwarded to the current `main`, pushed directly, and verified by exact-head CI. External vendor contact, quote acceptance, payment, fabrication, unsafe power testing and publication of restricted collateral require the explicit authority defined in `AGENTS.md`.

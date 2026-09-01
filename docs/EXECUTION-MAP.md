# Execution map

The canonical live work breakdown is the GitHub wayfinding map: [Wayfinder: deliver a working open-source TB4 KVM v1](https://github.com/0x63616c/tb4-kvm/issues/2).

It contains 53 named child tickets with native blocking relationships. GitHub Issues is authoritative for open/closed state, ownership and the current parallel frontier; this document explains the shape without duplicating that live state.

## Parallel work lanes

The safe early frontier has independent lanes for:

- PCB-1A channel allocation;
- exact mux/ESD models and prototype sourcing;
- optional later lab/measurement-route qualification;
- owner-captured pre-KVM desk baseline;
- owner-authorized PCBWay pre-layout construction inquiry;
- router and Type-C/PD reference access;
- early open-source collateral rules.

These can progress concurrently because none edits a shared released PCB source. Each result closes a decision or supplies evidence that sharpens later work.

## Prototype-first hardware spine

The first integrated prototype is gated by accepted reference access, exact parts/models, a modeled channel allocation, the controller prototype, redistribution audit and power-safety proof—not by paid PCB-1A RF measurement. Integrated schematic, layout/models, firmware/release, owner order, incoming inspection, protected bring-up, desk-specific compatibility and correction form the working-prototype critical path.

PCB-1A remains a useful RF coupon and diagnostic branch. Its layout/order/lab/measurement/correction workflow can proceed in parallel or be triggered later if the first integrated link is unreliable, a model needs correlation, or stronger electrical evidence is required. Until that measurement exists, claims remain functional and setup-specific rather than electrical-compliance claims.

Mechanical interface freeze waits for measured integrated hardware. Parametric enclosure/mount/pod design can then proceed in parallel with later compatibility work, but physical fit release waits for the final correction revision.

## Agent claiming rule

An agent may claim only an open, unassigned map child with no open blocker. It must persist its evidence in the repository, obtain the required independent review, comment the resolution with immutable links, close the ticket and add a one-line decision pointer to the map. Human-in-the-loop tickets remain unclaimed until the owner is participating or has granted the required external authority.

Agent selection is cost-tiered: fast/low-cost workers handle bounded research and mechanical/repetitive chores; balanced agents implement substantive PCB, firmware, site and CAD changes; strongest independent reviewers are reserved for safety, SI, manufacturing-release and final-validation gates. See [`docs/agents/AGENT-SELECTION.md`](agents/AGENT-SELECTION.md).

## Delivery policy

No pull requests for now. Each implementation slice is reviewed against its exact staged tree, rebased/fast-forwarded to the current `main`, pushed directly, and verified by exact-head CI. External vendor contact, quote acceptance, payment, fabrication, unsafe power testing and publication of restricted collateral require the explicit authority defined in `AGENTS.md`.

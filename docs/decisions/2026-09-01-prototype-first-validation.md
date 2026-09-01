# Decision: prototype-first validation route

Status: accepted for project execution on 2026-09-01

## Context

The earlier map made paid PCB-1A RF-lab measurement a hard predecessor of the integrated KVM. That maximized pre-order channel evidence but delayed the owner's primary outcome: get a narrow, safe TB4 KVM working on the actual desk soon, learn from physical hardware and iterate.

## Decision

Prototype A may proceed without paid PCB-1A measurement after all of these gates close:

- supported controller/reference/firmware route;
- exact sourceable parts and legally usable models or authoritative constraints;
- fabricator construction and modeled channel allocation with explicit uncertainty/margin;
- controller prototype and executable fault-state tests;
- reference-backed Type-C/PD/VBUS/VCONN design and protected power testing;
- independently reviewed schematic, layout, manufacturing release and bring-up procedure;
- owner approval of the exact immutable release, price and stated risks.

PCB-1A remains a useful diagnostic branch. Fabricate/measure it later when a 40 Gb/s failure needs localization, model correlation is valuable, or the project wants stronger electrical-performance evidence.

## Prototype-A claim boundary

Passing macOS enumeration, display, storage, networking, charging and repeated switching proves only desk-specific functional behavior. It does not prove Thunderbolt/USB4 electrical compliance, certification or universal compatibility. Missing VNA/TDR/BERT/interoperability evidence stays visible in the ledger and public site.

## Consequences

- Working hardware arrives sooner if reference, sourcing, safety and manufacturing gates close.
- Revision A has a higher chance of high-speed failure and harder diagnosis.
- At least one correction revision is planned rather than treated as exceptional.
- Affordable self-testing is used first; paid lab work is triggered by diagnostic value or stronger claims.
- Power isolation, Type-C/PD safety, independent release review and protected bring-up are never optional.

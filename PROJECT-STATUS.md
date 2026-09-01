# Project status

Last updated: 2026-09-01

This file is the durable pickup ledger. GitHub Issues is authoritative for live ticket state and dependency edges; this document records what is happening, why it is the next safe step and how another agent should continue without relying on chat history.

## Phase

Pre-PCB design review. The full project goal remains active. Work is not blocked, and no PCB is yet claimed order-ready.

## Locked decisions

- Thunderbolt 4, not Thunderbolt 5, for v1.
- Two upstream computers, one selected at a time.
- One physical button; no software required on the locked-down work computer.
- A small always-on controller and optional local display.
- Open source documentation, firmware, PCB and mechanical interface wherever vendor licensing permits.
- No PCB layout before the research package is reviewed.
- Prototype-first delivery: get a narrow, safe, desk-specific 40 Gb/s functional prototype working, expect correction revisions, then broaden validation.
- Do as much design, simulation, firmware, bring-up and functional testing ourselves as practical.
- Paid RF-lab measurement is not a blocker for the first integrated prototype; it remains a later diagnostic and claims-strengthening route.
- Start-up prefers Host A; if A is absent and B is the sole attached host, select B; with neither present, remain disconnected.
- The selected host target is up to 60 W; no charging is promised to the detached host, which may use a separate charger.
- Active-host removal waits for an explicit button press; v1 has no automatic failover.
- V1 validates the named OWC Thunderbolt Dock 96W first and makes no arbitrary-dock promise.
- Loss of KVM power isolates both hosts; no passive or dock-powered bypass is promised.
- Switching latency is measured before any time promise, and external-storage activity must be stopped or ejected before switching.
- Status is truthful and minimal; exact enclosure size is deferred until PCB and thermal measurements exist.
- Prototype A may use a separate KVM power brick.

## Recommended but not yet approved

- One TB4 accessory router with selectable upstream front end.
- One downstream TB4 port connected to the existing dock.
- Separate low-speed display/button daughterboard to keep its wiring away from TB4 traces.
- One signal/control proof followed by one integrated board and one correction revision.

## Open gates

- Intel reference design, controller firmware/NVM and certification path.
- Exact power-supply budget and whether 60 W selected-host charging is sufficient.
- Exact downstream behavior with the existing OWC dock and target display.
- S-parameter channel simulation and fabricator stack-up.
- Final connector, ESD, mux and PD-controller companion parts.
- Patent/legal review before any commercial sale, especially for dual-controller resource-switching alternatives.

The authoritative close criteria for these gates are tracked in [Design-readiness checklist](docs/DESIGN-READINESS-CHECKLIST.md). Signal responsibilities are fixed at the pre-schematic level in [Signal and power ownership](docs/SIGNAL-POWER-OWNERSHIP.md). Mechanical work is limited to the interface rules in [Mechanical interface guidance](docs/MECHANICAL-INTERFACE.md) until a measured integrated board exists.

## Reported baseline requiring recapture

On 2026-09-01, `system_profiler SPThunderboltDataType` was reported to show the connected OWC Thunderbolt Dock 96W in USB4 mode at 40 Gb/s. The raw sanitized command capture, exact host/cable context and immutable evidence record were not retained in this repository, so the ledger deliberately downgrades this to `PROPOSED`. Re-run the documented baseline capture before using it as measured evidence. Even after recapture it will be a functional baseline, not electrical compliance.

## Current execution checkpoint

The prototype-first execution map is active. The project owner accepted all eight
v1 product choices and the Prototype A conditions on 2026-09-01; the exact
machine-readable response and issue evidence are now the product contract.
Public controller/firmware and high-speed component/model research is complete
and independently reviewed; both gates remain blocked on exact external
evidence, with unsent owner-ready request packets prepared. The channel-budget
method/schema has completed multi-round adversarial SI review and is closed;
the later numeric allocation remains blocked. Issue #17 delivered an independently
reviewed interactive control-experience prototype covering the onboard switch,
truthful status, optional remote pod and fail-closed edge cases. It is the
provisional v1 control default. Issue #18 now has a reviewed PD-free executable
controller model with 57 checks, a live interactive model lab, a portable C11
controller core with 113 host checks, an isolated Pico 2 bench plan and a
content-verified B1-B13 physical-evidence contract. A software-only binding now
pins Pico SDK 2.3.0 and the Pico 2/RP2350A target, and a reviewed exact
acquisition/build pack prepares the low-value bench without ordering it. The
local host lacks the Arm cross-compiler, so the target has not been cross-built locally;
no Pico has been flashed and no physical bench has run yet. A GitHub Actions
workflow now provisions the Ubuntu 24.04 distro Arm toolchain, checks out the
exact SDK commit with its pinned submodules, builds the inert target and asserts
that no UF2 is emitted; it uploads no firmware artifact. The first exact-head
run, `33549186026`, proved toolchain/SDK/board setup but
failed because target-wide strict application warnings were also applied to
deliberate pointer conversions inside the pinned SDK IRQ source. The correction
now scopes those warnings to our `main.c`. Exact-head run `33549559925` then
compiled through 88% and proved Ubuntu's separate C++ Newlib package is required
by the SDK's `new_delete.cpp`; that package is now explicit. Exact-head run
`33549979596` subsequently built the inert ELF to 100%, found no UF2, uploaded
no artifact and passed. This is compile evidence only.
Later owner feedback may refine the UX without stopping
reversible work. Optional measurement-route
research for issue #6 found plausible staffed and rental leads but no publicly
proven complete contract.

Why: the owner prioritizes a working prototype soon and accepts iterative PCB revisions. We still require reference-backed design, modeling, power/PD safety, independent release review and protected bring-up, but paid high-speed measurement moves later unless a failure makes it necessary.

Latest evidence:

- Canonical live map: [GitHub issue #2](https://github.com/0x63616c/tb4-kvm/issues/2).
- Map audit: [`docs/reviews/2026-09-01-execution-map-audit.md`](docs/reviews/2026-09-01-execution-map-audit.md).
- Live API audit after the prototype-first revision: 53 child issues (#3–#55), 109 dependency edges, no cycles.
- Cost-aware agent routing: [`docs/agents/AGENT-SELECTION.md`](docs/agents/AGENT-SELECTION.md).
- Accepted route: [`docs/decisions/2026-09-01-prototype-first-validation.md`](docs/decisions/2026-09-01-prototype-first-validation.md).
- Revised-map audit: [`docs/reviews/2026-09-01-prototype-first-map-audit.md`](docs/reviews/2026-09-01-prototype-first-map-audit.md).
- Vendor/model evidence review: [`docs/reviews/2026-09-01-vendor-evidence-review.md`](docs/reviews/2026-09-01-vendor-evidence-review.md).
- Channel-budget contract review: [`docs/reviews/2026-09-01-channel-budget-contract-review.md`](docs/reviews/2026-09-01-channel-budget-contract-review.md).
- Collateral-policy review: [`docs/reviews/2026-09-01-collateral-policy-review.md`](docs/reviews/2026-09-01-collateral-policy-review.md).
- V1 owner decision packet: [`docs/product/v1-owner-decisions.md`](docs/product/v1-owner-decisions.md).
- Product-decision catalog and acceptance contract: [`design/product-decisions/catalog.json`](design/product-decisions/catalog.json) and [`design/product-decisions/response.schema.json`](design/product-decisions/response.schema.json).
- Owner-accepted v1 response: [`design/product-decisions/response.accepted.json`](design/product-decisions/response.accepted.json) and [issue evidence](https://github.com/0x63616c/tb4-kvm/issues/3#issuecomment-5497738070).
- Optional measurement-route evidence: [`docs/research/issue-6-measurement-route/README.md`](docs/research/issue-6-measurement-route/README.md).
- Owner-decisions/measurement-route review: [`docs/reviews/2026-09-01-owner-decisions-measurement-route-review.md`](docs/reviews/2026-09-01-owner-decisions-measurement-route-review.md).
- Product-decision contract review: [`docs/reviews/2026-09-01-product-decision-contract-review.md`](docs/reviews/2026-09-01-product-decision-contract-review.md).
- Owner-acceptance transcription review: [`docs/reviews/2026-09-01-owner-acceptance-review.md`](docs/reviews/2026-09-01-owner-acceptance-review.md).
- Interactive control-experience prototype and review: [`components/control-experience-prototype.tsx`](components/control-experience-prototype.tsx), [`docs/prototypes/control-experience.md`](docs/prototypes/control-experience.md) and [`docs/reviews/2026-09-01-control-experience-review.md`](docs/reviews/2026-09-01-control-experience-review.md).
- PD-free controller model, bench plan and review: [`firmware/controller-prototype/model.mjs`](firmware/controller-prototype/model.mjs), [`docs/research/issue-18-controller-bench/README.md`](docs/research/issue-18-controller-bench/README.md) and [`docs/reviews/2026-09-01-controller-prototype-review.md`](docs/reviews/2026-09-01-controller-prototype-review.md).
- Pico 2 cross-build workflow: [`.github/workflows/pico2-cross-build.yml`](.github/workflows/pico2-cross-build.yml) and successful exact-head [run `33549979596`](https://github.com/0x63616c/tb4-kvm/actions/runs/33549979596).
- Exact-head Pico 2 compile evidence: [`docs/validation/2026-09-01-pico2-cross-build-evidence.md`](docs/validation/2026-09-01-pico2-cross-build-evidence.md).
- Owner bench-inventory response: [`design/controller-bench/owner-inventory.response.json`](design/controller-bench/owner-inventory.response.json) (none owned; no purchase/cart authorization).
- Complete bench owner-approval packet: [`docs/research/issue-18-controller-bench/acquisition/OWNER-APPROVAL-PACKET.md`](docs/research/issue-18-controller-bench/acquisition/OWNER-APPROVAL-PACKET.md) and [`design/controller-bench/acquisition.approval.json`](design/controller-bench/acquisition.approval.json) (prepared, not approved or ordered).
- Independent bench-packet review: [`docs/reviews/2026-09-01-controller-bench-approval-packet-review.md`](docs/reviews/2026-09-01-controller-bench-approval-packet-review.md) (accepted as a decision aid; no cart/contact/purchase authority).

## Current frontier

Agent-ready implementation:

- #18 no reversible acquisition work remains before the owner decides whether to authorize a no-purchase cart/address calculation;

Owner participation or acceptance:

- #18 owner has confirmed none of the proposed controller-bench items are owned; explicit purchase approval remains required after the complete all-in packet is reviewed;
- #6 written capability/terms/quote confirmation only if the optional measurement branch is later triggered;
- #5 vendor model/source requests after owner review;
- #7 PCBWay pre-layout construction/capability inquiry;
- #19 Intel/Infineon developer access and exact topology/controller questions;
- #22 adoption of the independently reviewed early collateral policy;
- #52 pre-KVM desk baseline capture.

## Agent-routing decision

Use fast/lower-cost agents for bounded frontier research and issue hygiene. Use balanced agents for substantive PCB, firmware, CAD and site implementation. Reserve frontier reviewers for accepted architecture, power/PD safety, signal integrity, immutable manufacturing releases, firmware safety, physical CAD release and final v1 validation.

## Exact next pickup

1. Ask the owner separately for no-purchase cart/address-calculation authority; vendor contact and a later exact-item/max-spend purchase authorization remain distinct.
2. After owner direction, either calculate the landed cart without purchasing or continue without external action.
3. Continue collecting owner feedback without pausing reversible downstream work.
4. Ask the owner to adopt or amend the independently reviewed early collateral policy (#22) when it reaches the critical path.
5. Keep the prepared vendor/developer/fabricator requests unsent until the owner authorizes the relevant external contact or performs the submission.
6. Never freeze the integrated schematic/layout until its reference, model, safety and review gates actually close.

## Execution limits

- Research is not a compliance result.
- PCB CAD, simulation and DFM artifacts do not yet exist for an orderable revision.
- Physical fabrication and compatibility evidence necessarily occur after owner-approved orders and receipt; VNA/TDR evidence may occur later or when functional diagnosis requires it.
- No agent may purchase, accept a quote, submit fabrication or expose valuable equipment without the mapped owner gate.

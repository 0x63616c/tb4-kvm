# PCB-1A abstract topology contract

This folder describes the connectivity that a future **measurement-only RF
coupon** must represent. It is not a schematic, PCB layout, product KVM, or
order package.

Each of the four differential lanes (`D0` through `D3`) repeats this shape:

```text
Host A P/N measurement port ─ launch slot ─ optional ESD slot ─┐
                                                               ├─ mux slot ─ optional ESD slot ─ launch slot ─ Common P/N port
Host B P/N measurement port ─ launch slot ─ optional ESD slot ─┘
```

That gives three differential branches per lane—Host A, Host B, and Common—or
24 single-ended P/N measurement ports across all four lanes. The contract has
four required **fixture classes**, not four promised physical instances. After
launch, escape, ESD-population, lab, and stack-up choices freeze, the DUT class
requires an instance for every materially distinct launch/escape × fitted/DNP
ESD combination; the plain-through and 2x-through classes require an instance
for every materially distinct launch/escape. Their instance counts remain
explicitly blocked, so this record cannot be mistaken for a fabrication list.

For every Host-A/Host-B-to-common path, the proposed four-port campaign measures
that path's four P/N cable-end ports. Of the other 20 conductors, the state's
eight-port inactive host bundle uses that state's selected matched/open
termination, while the remaining 12 selected-host/common conductors are
matched at `CABLE_END`. The deterministic 4+8+12 partition documents a future
campaign mapping; it is not a lab booking, measurement, or de-embedding result.

The component names are **provisional slots**, not selected BOM items. Models,
footprints, launches, stack-up, trace geometry, numeric limits, and source
availability remain blocked by issues #5, #7, and #34. Layout and footprint
generation are explicitly unauthorized.

The coupon contains no USB-C receptacle, CC, PD, VBUS, VCONN, router, MCU, or
product-power path and cannot connect to a laptop or dock. Passing its validator
does not prove USB4/Thunderbolt compliance, signal-integrity closure, fabrication
readiness, or order readiness.

Run:

```sh
node design/pcb1a/validate-topology.mjs
node design/pcb1a/topology.test.mjs
```

The semantic validator exact-locks branch roles, the six state details, eight
lane/branch paths, P/N endpoints, one-path-at-a-time campaign rule, inactive
port termination plane/fixture, two proposed reference planes, all-paths-
disabled control defaults, source contracts, full blocked component-slot status,
fixture-class multiplicity rules, and every before-schematic/before-order/
not-claimed gate. It rejects premature readiness, forbidden product domains,
crossed/missing branches, unfrozen parts presented as available, and false
fixture-instance parity. The powered Hi-Z state remains conditional and blocked
on authoritative device-state evidence; neither plane is measured or
de-embedded by this contract.

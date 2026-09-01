# PCB 1 definition record

Status: `PROPOSED — scope not yet approved`.

## Purpose

PCB order 1 must retire the largest risks before an expensive integrated KVM revision. It is not automatically a miniature final product, and it is not useful unless every included structure has an available measurement method and a decision attached to the result.

## Decision: PCB-1A — high-speed channel/mux coupon

Independent review recommends this as the first fabricated PCB. It is measurement-only and cannot connect VBUS to a computer. Final owner approval is still required after the measurement method and quote are concrete.

Would include the selected fabricator stack-up, candidate connector launches, ESD options, mux package/branches, controlled differential structures and de-embedding/calibration structures.

The current pre-schematic connectivity is captured as a deliberately
[`PROPOSED` abstract topology contract](../design/pcb1a/README.md). It fixes the
four-lane/three-branch measurement vocabulary, fixture **classes**, and a
one-path-at-a-time four-port campaign rule while keeping physical fixture
instance counts, parts, footprints, stack-up, geometry, numeric limits, layout,
and ordering blocked. It is not the issue #8 topology freeze.

Questions:

- Does the fabricated connector–ESD–mux–via channel match the modeled S-parameters?
- What loss/reflection/mode-conversion penalty does each option add?
- Does the unselected branch create an unacceptable stub?
- Do PCBWay's actual impedance and material results match the model?

Required measurement access:

- adequately ported VNA or lab-equivalent setup with agreed frequency span and dynamic range;
- exact calibration reference plane, RF launches, thru/2x-thru structures, de-embedding method, inactive-port terminations and mux-state matrix;
- TDR/TDT only for the impedance/discontinuity evidence it can actually produce;
- raw single-ended and mixed-mode Touchstone outputs plus the comparison script.

The proposed instrument, calibration, port, termination, state and raw-evidence contract is in [PCB-1A mixed-mode measurement method](PCB-1A-MEASUREMENT-METHOD.md) and its machine-readable [measurement matrix](../design/pcb1a-measurement-matrix.json). It remains `PROPOSED_UNBOOKED`.

It must not be described as a compliant USB-C extender or complete KVM.

## Parallel PCB-1B candidate — low-speed controller/UI board

Would exercise the MCU, button, LEDs/display header, watchdog, logging, simulated sensor inputs, reset-safe selector outputs and remote-control electrical interface. It deliberately excludes USB-C PD, host VBUS and the high-speed lanes.

Questions:

- Can reset/brownout ever command both simulated host paths?
- Can the display/logging interface report truthful state and survive pod removal?
- Do fault injection, button bounce and interrupted transitions converge safely?

This board can be built on ordinary material because it contains no PD/high-power path. Its headers must have defined levels, protection and all-off defaults. It cannot validate attach, charging, USB4 state or real Gb/s.

## Later candidate — PD/power reference board

A CYPD5235-based PD/power board is not PCB-1. It is permitted only after legally usable firmware/configuration, exact reference schematic, programming/recovery procedure, external FET/protection selection, quantitative analyzer/scope criteria and independent power review exist. First tests use programmable Type-C source/load equipment, never a laptop.

## No-go now — minimal integrated router validation board

Would contain the full reference-derived two-upstream selector, one TB4 router, one downstream dock port, power system and minimal control interface.

It combines every major risk in one expensive board. It is not PCB-1. It remains blocked on Intel/reference access, the approved router/PD/mux combination, downstream power ownership, package/escape data, firmware/NVM, channel simulation and job-specific fabricator DFM.

## Decision criteria

Release PCB-1A only after answering:

1. Which exact mux/ESD/launch OPNs and usable S-parameter/package models are available?
2. Which written channel limits and simulation assumptions will PCB-1A test?
3. Which VNA/lab setup can produce the required calibrated mixed-mode evidence?
4. What exact decision follows every test result?
5. Does the coupon minimize total time to a reliable integrated KVM, not merely time to first shipment?

If no adequately ported calibrated VNA/lab-equivalent and agreed fixture/de-embedding route is available, PCB-1A is a no-go because it would create copper without decision-quality mixed-mode evidence. TDR/TDT is supplemental unless the chosen system demonstrably provides the required calibrated conversion.

## Order-ready definition

PCB 1 becomes order-ready only when its owner-approved questions, schematic/layout, BOM, stack-up, measurement procedure, pass/fail limits, independent reviews, DFM confirmation, manufacturing outputs and release manifest are all present and have no unresolved release blocker.

For PCBWay specifically, the release package also requires written job-specific stack-up and tolerances; accepted impedance/de-embedding coupon geometry; per-panel impedance/TDR report requirement; as-built stack-up/microsection or equivalent construction evidence; named material and lot traceability/CoC expectation; and the measurement lab's acceptance of the fabricated coupon geometry. Generic capability-page claims do not close this gate.

Use the [PCBWay pre-quote engineering inquiry](PCBWAY-PREQUOTE-INQUIRY.md) to obtain those written answers. The document is a draft only and authorizes neither submission nor fabrication.

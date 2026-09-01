# PCB 1 definition record

Status: `PROPOSED — scope not yet approved`.

## Purpose

PCB order 1 must retire the largest risks before an expensive integrated KVM revision. It is not automatically a miniature final product, and it is not useful unless every included structure has an available measurement method and a decision attached to the result.

## Decision: PCB-1A — high-speed channel/mux coupon

Independent review recommends this as the first fabricated PCB. It is measurement-only and cannot connect VBUS to a computer. Final owner approval is still required after the measurement method and quote are concrete.

Would include the selected fabricator stack-up, candidate connector launches, ESD options, mux package/branches, controlled differential structures and de-embedding/calibration structures.

Questions:

- Does the fabricated connector–ESD–mux–via channel match the modeled S-parameters?
- What loss/reflection/mode-conversion penalty does each option add?
- Does the unselected branch create an unacceptable stub?
- Do PCBWay's actual impedance and material results match the model?

Required measurement access:

- appropriate VNA/TDR fixtures or rented lab;
- agreed port/de-embedding plan;
- raw Touchstone results and comparison script.

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

1. Which vendor/reference materials and programmable images are actually available?
2. Which high-speed models and accepted channel limits are available?
3. Which instruments or rental/lab services can measure a coupon?
4. Can supported evaluation boards prove PD/power behavior without custom copper?
5. What exact decision follows every test result?
6. Which option minimizes total time to a reliable integrated KVM, not merely time to first shipment?

If no VNA/TDR or agreed lab fixture/de-embedding route is available, PCB-1A is a no-go because it would create copper without decision-quality evidence.

## Order-ready definition

PCB 1 becomes order-ready only when its owner-approved questions, schematic/layout, BOM, stack-up, measurement procedure, pass/fail limits, independent reviews, DFM confirmation, manufacturing outputs and release manifest are all present and have no unresolved release blocker.

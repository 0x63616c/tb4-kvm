# Candidate parts by evidence stage

This is research, not an orderable BOM. A component's marketing support for TB4 does not validate the complete channel or a cross-vendor architecture.

## PCB-1A: measurement-only mux coupon

| Function | Candidate | Evidence | Release condition |
| --- | --- | --- | --- |
| Four fast-pair selector | TI TMUXHS4512, exact OPN pending | Manufacturer names USB4/TB3/TB4 and 20 Gb/s on each main differential channel | Public package plus S-parameter models; full pre/post-layout channel model; lab accepts fixture |
| Alternate selector | Diodes PI2DBS32412 research alternative | Manufacturer explicitly positions newer family for TB4/USB4 | Compare models, availability, controls and reference-design acceptance |
| Older precedent only | Diodes PI3DBS16412 | Teardown identifies it in a shipping KVM; manufacturer page is TB3/20 Gb/s evidence | Never relabel teardown precedent as primary TB4 approval |
| Lane ESD option | Semtech RClamp01012ZC or reference-approved equivalent | Manufacturer component-level USB4/TB4 claim | Fit/DNP comparison and full channel model; not automatically populated |
| RF launches | Lab-agreed connectors/fixture | Must support calibrated mixed-mode VNA/equivalent S-parameters, de-embedding, and supplemental TDR/TDT | Exact launch, calibration structures and mating hardware agreed before layout |
| Coupon supply | Clean external 1.8 V input, exact parts pending | TMUX supply requirement follows selected OPN | Noise/ripple budget and safe static control interface reviewed |

The coupon has no USB-C receptacle, CC, VCONN, VBUS, PD controller, router, MCU or display. It cannot power or attach to a laptop.

## PCB-1B: low-speed controller/UI board

| Function | Candidate | Evidence | Main limitation |
| --- | --- | --- | --- |
| Supervisor | RP2040-class MCU | Public tooling and sufficient GPIO for a simulated state/control board | Not frozen; has no role in 20 Gb/s traffic or Type-C policy |
| Prototype display | Small detachable I²C/SPI OLED | Useful for truthful state/telemetry prototypes | Optional; keep away from future high-speed lanes |
| Telemetry simulator | Protected analog/digital inputs; optional INA238 on safe bench rail | Can exercise display and logging paths | Does not validate host charging unless later redesigned/reviewed for that domain |
| Control outputs | Protected open-drain/buffered headers, exact parts pending | Enables reset/fault/all-off tests against fixtures | Voltage/current/pull defaults must be defined before release |

## Integrated KVM candidates — gated, do not order

| Function | Candidate | Public evidence | Blocking limitation |
| --- | --- | --- | --- |
| TB4 accessory router | Intel JHL9440 | Public page identifies a launched quad-port TB4 accessory-controller family | Package, land/escape, supported topology, NVM, firmware and electrical reference material are developer-gated |
| Dual upstream Type-C/PD | Infineon CYPD5235 CCG5 | Public dual-port docking controller and dual-upstream Thunderbolt application | No public evidence establishes a ready JHL9440 combination or redistributable firmware/configuration |
| USB2/SBU ownership | CCG5/reference-design path | CCG5 includes relevant routing/protection capabilities | Do not automatically cascade TS3USB221A or TPD4S311A; follow exact accepted reference design |
| Power subsystem | No candidate yet | Requirement is known | “Reference-design PFET/eFuse stages” is not a BOM item; exact FETs, drivers, shunts, discharge and protection remain unresolved |
| Power telemetry | INA238 plus four-terminal shunt, if reference design permits | Can measure volts/current/watts | Shunt and layout affect the protected power path and require review |

## Cross-vendor compatibility rule

`JHL9440 + CYPD5235 + TMUXHS4512` is a hypothesis, not an approved combination. The integrated BOM remains blocked until the accepted Intel design package names or explicitly permits the router, PD controller, mux, protection, clocks, NVM, power parts and topology.

## Exact-BOM release fields

Every fitted part must eventually record:

- exact manufacturer orderable part number and lifecycle status;
- manufacturer document revision and supported claim;
- authorized source, lead time, alternates and substitution rule;
- package, pitch, MSL, storage and reflow data;
- S-parameter/model revision for every channel component;
- assembler-sourced or consigned status, overage and unused-part disposition;
- firmware/NVM/programming dependency and legal redistribution boundary.

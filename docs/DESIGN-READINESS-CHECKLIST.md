# Design-readiness checklist

This is the stop/go record for schematic capture and PCB layout. “Plausible,” “ordered,” or “OS reports 40 Gb/s” do not count as complete evidence.

The machine-checked [integrated schematic-entry contract](../design/integrated-schematic-entry/README.md) mirrors this boundary. It is `PROPOSED`, leaves capture/order unauthorized, and cannot close any gate in this checklist.

## Current gate status

| Gate | Current state | Evidence required to close it |
|---|---|---|
| Product behavior | **Owner choice accepted; implementation proof open** | Reference-backed detach/re-enumerate implementation and measured switch-stage timing |
| Selected-host charging | **Owner choice accepted; electrical proof open** | Reference-backed 60 W selected-host design, supply budget and measured protected-power behavior |
| Existing dock baseline | **Topology captured; behavior baseline incomplete** | Add exact host model, cable, dock, display, Ethernet, USB, storage, charging, sleep/wake and power-cycle context to the retained sanitized literal topology capture |
| Intel controller access | **Open — hard blocker for integrated layout** | Current reference schematic, layout rules, firmware/NVM path, legal prototype terms and sourcing |
| Infineon PD implementation | **Open — hard blocker for integrated layout** | Supported dual-upstream application firmware/configuration and programming/debug route |
| Channel model | **Open** | Connector, ESD, mux, package and trace S-parameters in the chosen stack-up pass simulation |
| Power safety architecture | **Open** | Reviewed FET/protection/discharge design and fault analysis proving host isolation |
| Mechanical envelope | **Correctly deferred** | Stable board STEP, connector models and measured thermal map |
| Certification route | **Open** | Written pre-compliance and Intel/USB-IF lab plan, budget and permitted branding claims |
| Open-source release boundary | **Open** | List what can be redistributed versus vendor-confidential firmware/reference material |

## Accepted owner choices and remaining measurements

The owner accepted the eight v1 choices in
[`design/product-decisions/response.accepted.json`](../design/product-decisions/response.accepted.json): prefer Host A at startup, up to 60 W for the selected host, no automatic failover, named OWC dock first, isolate both hosts on KVM-power loss, measure switching stages before promising latency, truthful minimal status, and defer the exact envelope until PCB/thermal measurement.

These product choices do not close the electrical gate. Before schematic/layout
release, record the exact display resolution/refresh, host models and cable identities,
dock firmware, required peripheral behavior, supported controller timing, power
budget/protection and physical clearances. A local display remains optional; the
main enclosure still requires onboard button control and minimal truthful status.

## Technical evidence gate

Do not start the integrated PCB until all are attached to the project record:

- exact orderable manufacturer part numbers and lifecycle status;
- router and PD reference schematics with redistribution rules recorded;
- verified programming tools, firmware images/configs and recovery procedure;
- real PCB fabricator stack-up and impedance rules;
- end-to-end high-speed channel simulation, including both mux branches and unselected stubs;
- power tree with worst-case current, conversion loss and thermal estimates;
- formal switch-state table covering power-on, reset, brownout, detach, timeout and fault;
- schematic review checklist mapped to the signal ownership matrix;
- prototype validation fixtures and pass/fail thresholds.

## Rev A authorization boundary

PCB-1A may begin before full router access only if it remains the frozen RF-launch-only measurement vehicle: lab-agreed RF launches, DNP/fitted ESD options, candidate mux and calibration/de-embedding structures. It contains no USB-C receptacle, CC/PD, VCONN, VBUS or router and cannot connect to a laptop. A different topology requires a new decision and independent review.

A low-speed PD/control/UI proof may proceed in parallel only on supported evaluation hardware as a separate experiment; this is not the PD-free PCB-1B. It must retain its reference, firmware and safety gates and must not connect two source VBUS rails without the reviewed protection topology.

## Definition of ready for Rev B layout

Rev B is ready only when every hard gate above is closed, the accepted owner choices are implemented as testable requirements, the schematic has independent electrical and signal-integrity review, and the layout constraints are generated from the accepted channel model. If any item is unknown, the correct artifact is an experiment or a question—not production copper.

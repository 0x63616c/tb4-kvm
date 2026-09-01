# Design-readiness checklist

This is the stop/go record for schematic capture and PCB layout. “Plausible,” “ordered,” or “OS reports 40 Gb/s” do not count as complete evidence.

## Current gate status

| Gate | Current state | Evidence required to close it |
|---|---|---|
| Product behavior | **Review required** | User accepts selected-host detach/re-enumerate behavior and target switch time |
| Selected-host charging | **Review required** | User accepts the v1 wattage target and external power-supply size |
| Existing dock baseline | **Partially evidenced** | Current OWC dock reports USB4/40 Gb/s; record display, Ethernet, USB and storage matrix |
| Intel controller access | **Open — hard blocker for integrated layout** | Current reference schematic, layout rules, firmware/NVM path, legal prototype terms and sourcing |
| Infineon PD implementation | **Open — hard blocker for integrated layout** | Supported dual-upstream application firmware/configuration and programming/debug route |
| Channel model | **Open** | Connector, ESD, mux, package and trace S-parameters in the chosen stack-up pass simulation |
| Power safety architecture | **Open** | Reviewed FET/protection/discharge design and fault analysis proving host isolation |
| Mechanical envelope | **Correctly deferred** | Stable board STEP, connector models and measured thermal map |
| Certification route | **Open** | Written pre-compliance and Intel/USB-IF lab plan, budget and permitted branding claims |
| Open-source release boundary | **Open** | List what can be redistributed versus vendor-confidential firmware/reference material |

## User review gate

Before schematic capture, explicitly decide:

- Is it acceptable that the unselected laptop disconnects from the dock and normally does not charge?
- Is 60 W the right v1 charging target, or must it be higher?
- Is reconnect time of several seconds acceptable after pressing the button?
- Is the existing OWC dock always the downstream device, or must the KVM expose additional native downstream ports?
- Which exact display resolution and refresh rate must survive switching?
- Is the local display required for v1 or a detachable option?
- Is one button sufficient, and should long-press perform a safe power-cycle/recovery action?
- Must the device fit a particular desk/mount envelope, and what measured clearances constrain it?

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

A signal coupon may begin before full router access only if it is labeled as a measurement vehicle, not a compliant USB-C extender or product prototype. It may contain receptacles, ESD options, candidate muxes and calibration structures, but it must not be presented as validating CC/PD topology or Thunderbolt certification.

A low-speed PD/control/UI proof may proceed in parallel using supported evaluation hardware. It must not connect two source VBUS rails without the reviewed protection topology.

## Definition of ready for Rev B layout

Rev B is ready only when every hard gate above is closed, the user-review decisions are recorded, the schematic has independent electrical and signal-integrity review, and the layout constraints are generated from the accepted channel model. If any item is unknown, the correct artifact is an experiment or a question—not production copper.

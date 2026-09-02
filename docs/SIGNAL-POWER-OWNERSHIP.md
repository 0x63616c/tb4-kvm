# Signal and power ownership

This is the pre-schematic contract for the two-host/one-dock TB4 KVM. It prevents the common mistake of treating all 24 USB-C contacts as one bus that can be switched by one part.

The future-sheet names, three-domain separation, and fail-safe defaults are also locked as a pre-capture record in the [integrated schematic-entry contract](../design/integrated-schematic-entry/README.md). That record is not an electrical schematic and cannot authorize capture.

## Ownership matrix

| Electrical system | USB-C contacts | Required owner | Selected path | Safe unselected state | Evidence before layout |
|---|---|---|---|---|---|
| High-speed USB4/TB lanes | TX1/RX1/TX2/RX2, four differential pairs | 20 Gb/s-per-lane 2:1 mux approved by the router reference design | Selected host to TB4 router upstream | High impedance; no stub longer than the simulated limit | Package/connector/mux S-parameters and complete channel simulation |
| USB 2.0 | D+ and D− | Reference-design-supported USB2 owner; possibly integrated in CCG5 | Selected host to router USB2 input | High impedance | Both orientations enumerate and pass USB2 compliance/functional tests |
| Sideband | SBU1 and SBU2 | Reference-design-supported orientation-aware owner; possibly integrated in CCG5 | Selected host to router link-management/AUX pins | High impedance | Vendor routing table and orientation test matrix |
| Configuration Channel | CC1 and CC2 | One USB-C/PD policy engine per upstream port, or a documented dual-port controller | Each upstream receptacle retains its own attach and PD identity | Valid detached or non-selected policy; never hard-wire the two ports together | PD traces for attach, flip, role, contract, detach and fault cases |
| Cable power | VCONN on inactive CC contact | PD controller plus protected VCONN switch | Only where the attached cable requires it | Off with discharge behavior per reference design | E-marked cable tests in both orientations |
| Host charging | VBUS contacts | PD controller, back-to-back FETs, current/voltage sensing, OVP/OCP and discharge | Local supply to selected host after a valid contract | Isolated; no reverse current or shared host rail | Scope and PD-analyzer captures for every transition and injected fault |
| Signal/power ground | GND contacts | PCB reference plane and power-return design | Continuous low-impedance return path | Continuous low-impedance return path | Stack-up, return-via and fault-current review |
| Connector shell/chassis | Receptacle shell tabs; any conductive enclosure | EMC/chassis strategy distinct from signal ground | Reference-derived DC/capacitive bond | Same; never assumed identical to signal ground | Reference design plus EMC/shield-bond review |
| Downstream CC and roles | Dock-facing CC1/CC2 | **Unassigned blocker:** reference-supported downstream Type-C/PD policy engine | Legal dock/host-facing role for the accepted router design | Defined safe behavior for charger, host, unpowered dock and second hub | Exact reference schematic plus PD traces from the target OWC dock |
| Downstream VBUS/VCONN | Dock-facing VBUS and inactive CC contact | **Unassigned blocker:** protected source/sink/reverse-current/VCONN subsystem | Must follow accepted router/dock policy | No dock-originated backfeed to either host or system rail | Fault analysis, scope captures and PD analyzer in every wrong-role case |
| Selection control | Mux select/enable, PD requests, router reset/status | Always-on MCU coordinating documented hardware state machines | Break-before-make sequence | Default to all fast/USB2 paths disabled | Power-on, reset, brownout and watchdog tests |
| User interface | Button, OLED, LEDs and sensors | Low-speed MCU/daughterboard | Reports control-plane facts only | Must remain powered during host handover | Telemetry source map and fault-injection tests |

## Why the TMUXHS4512 is called six-channel

The candidate device exposes four high-speed differential channels, one DDC/AUX differential channel and one single-ended HPD path. The four high-speed channels match the four USB4/TB differential pairs. The AUX channel may be useful for the SBU pair if the final router/PD reference design permits it. HPD is only one wire, so it cannot replace a two-wire USB2 D+/D− switch.

This part does not own CC, VCONN or VBUS. Its marketing count must never be interpreted as “all USB-C signals are covered.”

## Switching state machine

The exact delays and commands must come from the selected controller reference designs. The required ordering invariant is:

```text
request switch
  → present the stop/eject requirement and wait for explicit user acknowledgement
  → detach old host through its PD policy engine
  → turn old-host source path off and verify VBUS discharge/isolation
  → disable high-speed, USB2 and SBU selectors
  → authorize the new host PD policy to advertise Rp
  → detect valid Rd attachment and orientation
  → apply default VBUS only as the PD policy permits
  → select the new orientation-aware signal path
  → negotiate PD and verify the contracted voltage
  → allow router discovery, link training and tunnel enumeration
  → report ready only after supported status or observable enumeration
```

The normal state machine must not claim that the MCU can detect application-level storage quiescence. Switching during an active storage write is a separate destructive fault-injection test, permitted only with disposable media/data and an explicit recovery and integrity check.

The design must fail safe if the MCU resets halfway through. Hardware enable defaults and pull resistors must select “all paths off,” not either host.

## Non-negotiable invariants

1. Host A VBUS and Host B VBUS are never electrically joined.
2. Host A CC and Host B CC are never directly joined or controlled as ordinary GPIO.
3. Selection is break-before-make for high-speed, USB2, SBU and host power.
4. No UI firmware failure can override PD-controller or power-protection hardware.
5. The MCU never measures or intercepts the 20 Gb/s data lanes.
6. The displayed state distinguishes selected, attached, PD-contracted, link-trained and fully enumerated; these are not synonyms.
7. Every connector orientation is part of the test matrix.
8. The downstream dock port is a complete Type-C/PD power domain; labels do not make wrong-role connections safe.
9. Signal ground and connector shell/chassis are documented and reviewed separately.

## Schematic-page boundaries for the future design

These are documentation boundaries, not permission to begin capture:

1. `UPSTREAM_A_PD_POWER` — receptacle A, CC/PD, VCONN, VBUS FETs and protection.
2. `UPSTREAM_B_PD_POWER` — identical responsibility for receptacle B.
3. `HS_USB2_SBU_SELECT` — high-speed mux, USB2 switch, SBU path, ESD and orientation mapping.
4. `TB4_ROUTER` — controller, clocks, SPI/NVM and required core power rails.
5. `DOWNSTREAM_PD_POWER` — dock receptacle, CC/PD, VCONN, VBUS isolation/protection and wrong-role behavior.
6. `SYSTEM_POWER` — external input, rail generation, sequencing, sensing and thermal protection.
7. `MCU_UI` — button, display header, sensors, logs and watchdog.

No net may cross one of these boundaries without a named owner and a documented safe state.

The downstream owner is deliberately unresolved. While it remains unresolved, the integrated schematic/layout gate is closed.

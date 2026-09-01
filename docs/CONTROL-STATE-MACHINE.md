# Controller and display state model

The small always-on MCU is a supervisor. It requests operations from the PD and Thunderbolt subsystems, reads supported status, controls the external signal selectors, records timing/fault events and updates the local display. It does not decode Thunderbolt traffic.

The machine-readable model is [`design/control-state-machine.json`](../design/control-state-machine.json). Run `npm run verify:control` to check its executable architectural invariants. A passing result proves internal model consistency only; it is not PD, signal-integrity or compliance evidence.

## Normal Host A to Host B sequence

```text
READY A
  → request detach A
  → receive detach confirmation and loss of A's PD contract
  → force high-speed, USB2 and SBU paths OFF
  → disable A source FETs and discharge A VBUS
  → measure A VBUS below the vendor-derived safe threshold before timeout
  → authorize B's PD policy engine to advertise Rp
  → detect valid B attachment and orientation
  → apply default VBUS under B's PD policy
  → enable B's orientation-correct signal route
  → negotiate PD and verify the contracted voltage
  → request supported USB4/TB mode entry
  → observe link training and enumeration where status is available
  → READY B
```

Host B to Host A is symmetric. Exact command order, timers, voltage thresholds and status registers must be replaced with values from the supported Intel and Infineon reference designs.

The JSON represents A-route, B-route, A-source and B-source commands and physical readbacks independently. This is essential: a single enum can hide the real failure where two enable pins or two FET paths conduct at once. Normal transitions are restricted to adjacent states in the declared sequences, every non-fault state has a higher-priority asynchronous fault edge, and timeout disposition is latched fault.

## Downstream dock blocker

The dock-facing receptacle is not merely “data out.” The target self-powered OWC dock can source laptop-charging power, so this project still needs a reference-supported owner for downstream CC, VBUS, VCONN, role policy, discharge and reverse-current blocking. `integratedDesignAuthorized` remains false in the model until that subsystem is resolved and independently reviewed.

## Why the MCU needs separate always-on power

During the all-off gap neither laptop is a dependable power source. If the MCU were bus-powered from the selected host, it could reset at the exact moment it must maintain isolation and finish the transition. The UI/control rail therefore comes from the KVM's external supply and defaults every mux/power enable to off while reset is asserted.

## What the display is allowed to say

| Display claim | Required evidence |
|---|---|
| `HOST A/B SELECTED` | MCU output/readback for all signal selectors agrees |
| `ATTACHED` | PD controller reports a valid CC attachment and orientation |
| `20.0 V · 3.0 A CONTRACT` | PD controller reports the negotiated contract |
| `44.2 W` | Local voltage/current monitor measurement, not the advertised contract |
| `USB4/TB MODE` | Supported PD/router status confirms mode entry |
| `LINK TRAINED` | Supported router status or explicitly labeled host-side observation |
| `READY` | Selected path, PD contract and link/enumeration evidence all agree |
| `40 Gb/s` | Supported router/host negotiated-rate evidence; never inferred from the mux rating |
| `1.2 GB/s LIVE` | Not available without supported router counters, an analyzer or host helper |

If a piece of controller status is not available under redistributable documentation, the display must use an honest weaker label such as `HOST CHECK` or `WAITING FOR DEVICES`.

## Fault behavior

Overcurrent, overvoltage, reverse current, failed discharge, inconsistent selector readback, PD-controller timeout, brownout or watchdog reset must converge on `FAULT_LATCHED`:

- high-speed, USB2 and SBU selector enables off;
- both host source paths off;
- router reset policy determined by the reference design;
- fault code and last safe transition retained in nonvolatile or reset-persistent logs where practical;
- no automatic retry loop that repeatedly applies a dangerous power condition.

Recovery requires the fault input to clear, both host paths to be observed isolated and a deliberate retry policy. A long button press may request recovery, but it cannot bypass hardware protection.

## Timing telemetry

Record timestamps for button press, old-host detach, VBUS isolated, paths selected, new PD contract, mode entry, link-ready status and final enumeration observation. This produces a truthful switch-time breakdown without observing packet payloads and makes intermittent failures diagnosable.

## Boundary between model and firmware

This is executable design intent, not production firmware. Production code cannot be written responsibly until the selected controllers expose their supported command/status interfaces, thresholds, timers, reset requirements and failure behavior. The JSON model exists now so those vendor-specific details have a clear place to land and so independent reviewers can identify unsafe transitions before hardware exists. Its current status explicitly rejects it as production-firmware input.

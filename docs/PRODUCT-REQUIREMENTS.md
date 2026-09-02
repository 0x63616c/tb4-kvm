# Product requirements

Status: v1 product behavior accepted by the owner on 2026-09-01. These requirements describe intended behavior, not current implementation evidence. The machine-readable authority is [`design/product-decisions/response.accepted.json`](../design/product-decisions/response.accepted.json).

## Product statement

A minimal externally powered device that connects two Thunderbolt 4 computers to one existing Thunderbolt 4 dock and selects which computer owns the entire dock using a physical control, with no required software on either computer.

## External interface

Required on the main enclosure:

- `HOST A` TB4/USB-C receptacle.
- `HOST B` TB4/USB-C receptacle.
- `DOCK` TB4/USB-C receptacle.
- External DC power input sized for local electronics and the approved host-charging policy.
- One onboard host-select button.
- Minimal selected/fault status indication.
- One protected, keyed, low-speed expansion connector for an optional remote button/display pod.

Not included in v1:

- Extra USB, Ethernet, audio, HDMI or DisplayPort ports.
- Touchscreen or mandatory display.
- Mandatory host software, cloud service, Bluetooth or Wi-Fi.
- Thunderbolt 5.
- Both hosts retaining simultaneous access to the dock.
- Live bandwidth measurement without a supported controller source.

## Host-selection behavior

| Condition | Required behavior |
|---|---|
| Only A is discoverable at power-up | Select A automatically after legal Type-C/PD discovery |
| Only B is discoverable at power-up | Select B automatically after legal Type-C/PD discovery |
| Both are discoverable at power-up | Select A after legal Type-C/PD discovery |
| Neither is discoverable | Remain in safe idle with host data/source-power paths off |
| Second host appears while one is active | Do not steal the dock or interrupt the active host |
| User requests an absent/unavailable host | Keep the active host connected; indicate unavailable; do not create a pointless detach |
| Active host detaches and the other is available | Indicate the loss and wait for a physical button request; do not automatically fail over |
| Remote pod is absent or fails | Onboard control remains usable; unsafe commands are impossible |
| Supervisor resets or browns out | Hardware defaults route and host source-power commands off |

“Discoverable” and “available” must be implemented using supported Type-C/PD behavior. They are not ordinary connector-presence GPIO signals. If the selected architecture cannot know an electrically detached host’s presence continuously, the UI and scan policy must state that limitation honestly.

## Switching behavior

- Physical onboard switching always works without software.
- Short press requests the other available host.
- No transition may make both host data routes or host source-power paths active.
- New-host data routing follows attach and orientation discovery.
- “Ready” is displayed only with the required supported control/link evidence.
- Exact detach, discharge, attach, mode-entry and training behavior follows the accepted controller reference design.
- The project records total switch time and each observable sub-stage.
- Normal operation requires the user to stop or eject external-storage activity
  before requesting a switch; v1 does not promise safe switching during writes.
- In-write switching is permitted only as an explicitly destructive validation
  fault on disposable media/data with recovery and integrity results recorded.

Optional future control sources may use the same safe request interface:

- detachable button/display pod;
- local service command;
- optional host application;
- local home-automation integration.

None may bypass the central guarded state machine or hardware protection.

## Remote-control expansion

- Low-speed only; no TB4 lane access.
- Keyed connector visually/mechanically distinct from USB-C.
- Protected against ESD, shorts, reversal and pod hot-unplug as appropriate.
- Main KVM owns all safety decisions; the pod sends requests and renders reported state.
- Final electrical protocol and pinout selected after cable-length and EMC review.
- Physical pod, screen and mounting style are deliberately deferred.

## Display truth policy

May show when supported by named evidence:

- selected host and switching stage;
- attach/orientation and PD contract;
- measured voltage, current and watts;
- faults, temperature, elapsed switch time and firmware version;
- mode/link/rate only when the chosen controller exposes a supported status source.

Must not imply without evidence:

- live Thunderbolt throughput;
- application activity or computer telemetry;
- formal compliance from component capability or OS enumeration alone.

## Performance and compatibility target

- Thunderbolt 4 / USB4 Gen 3 functional link reported at 40 Gb/s with supported hosts, dock and certified cables.
- Existing OWC Thunderbolt Dock 96W is the primary downstream target.
- Exact display model/resolution/refresh and both host models must be recorded before the integrated validation matrix freezes.
- USB2, USB3, PCIe storage, Ethernet and DisplayPort tunnels must operate concurrently through the existing dock within host/dock bandwidth limits.

## Accepted v1 power and downstream policy

- selected host: data plus up to 60 W charging;
- unselected host: no dock data and no promised charging;
- control/router electronics: always powered from the external supply;
- downstream dock VBUS: independently managed according to the supported reference design and never transparently passed to a host by assumption.
- downstream compatibility promise: validate the named OWC Thunderbolt Dock 96W first; broader devices require separate validation.
- KVM external-power loss: isolate both hosts and make no dock-powered pass-through promise.

The integrated design remains blocked until the accepted named-OWC/no-pass-through
policy has a reference-backed implementation that explicitly defines how
dock-originated power is rejected, consumed or otherwise managed; minimum
downstream accessory power; isolation/discharge behavior without KVM external
power; and the measurable limits of the named-dock compatibility promise.

## Wrong-port and fault behavior

Labels and connector placement improve usability but are not electrical protection. Each receptacle needs a safe, testable outcome for:

- laptop connected to `DOCK`;
- powered dock or USB-C charger connected to `HOST A` or `HOST B`;
- unpowered KVM with powered dock and/or host attached;
- active/e-marked cables in both orientations at every port;
- two hosts attached during reset, brownout or watchdog recovery;
- short, overcurrent, reverse-current and failed-discharge conditions.

Hardware protection must reach a safe state without successful MCU firmware.

## Requirements still to measure and freeze

Before an integrated schematic is allowed, record exact host models, display resolution/refresh, dock firmware, certified cable identities/lengths, required USB2/USB3/PCIe behavior, acceptable switch latency, sleep/wake behavior, ambient range, enclosure material, target service life and switching-cycle target.

## Release success

The product is not considered working merely because it enumerates once. Release requires the full validation matrix, independent reviews, reproducible manufacturing/CAD artifacts and explicit known limitations described in `docs/PROJECT-PLAN.md`.

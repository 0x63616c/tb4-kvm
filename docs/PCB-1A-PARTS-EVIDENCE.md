# PCB-1A exact candidate-parts evidence

Claims checked against manufacturer pages on 2026-09-01. These are named research candidates, not a released BOM.

## Provisional OPNs

| Function | Provisional exact OPN | Current primary-source evidence | Freeze disposition |
| --- | --- | --- | --- |
| Four-pair mux | `TMUXHS4512IRETT` | TI lists active/production, industrial −40…125 °C, RET 40-pin 3 × 6 mm/0.4 mm WQFN, 250-piece small tape/reel. `.A` is an identical alias; use the base OPN. TI direct inventory was out of stock at capture. [TI part page](https://www.ti.com/product/TMUXHS4512/part-details/TMUXHS4512IRETT) | Schematic research OPN only. No layout/channel freeze without a usable multi-state S-parameter model and prototype source. |
| Production carrier alternative | `TMUXHS4512IRETR` | Same industrial silicon/package in 3,000-piece large tape/reel; not the prototype default. [TI part page](https://www.ti.com/product/TMUXHS4512/part-details/TMUXHS4512IRETR) | Carrier alternative only; direct inventory was also out of stock at capture. |
| Optional lane ESD | `RClamp01012ZC.F` | Semtech lists the sole order code as 15,000/reel, 7-inch; two lines, ±1 V working, 0.17 pF typical/0.21 pF maximum, and names USB4/TB4. [Semtech product page](https://www.semtech.com/products/circuit-protection/usb/rclamp01012zc) | DNP comparison candidate only until model, lifecycle, land pattern, assembly and source evidence close. |

The [TMUXHS4512 datasheet](https://www.ti.com/lit/ds/symlink/tmuxhs4512.pdf) provides the public mechanical outline/example land pattern, but TI's public product page exposes no TMUXHS4512 S-parameter or IBIS download. Semtech's public page exposes no broadband model for `RClamp01012ZC.F`. A scalar capacitance cannot model insertion/return loss, mode conversion, package coupling, ground inductance or pad/via parasitics.

## Electrical facts that constrain the coupon

For `TMUXHS4512IRETT`:

- VCC 1.62–1.98 V; use nominal 1.8 V and the shown 0.1 µF local decoupling as a starting point;
- typical active current 500 µA; power-down 0.07 µA typical/2 µA maximum;
- `EN=0` makes every data and sideband channel Hi-Z;
- public switching characteristics list 200 µs power-on, 550 ns power-off and 60 µs A/B selection;
- controls are `EN`, `D_AB_SEL` and `SIDEBAND_SEL`; give every input a deterministic default and default `EN` low;
- high-speed common mode is 0–1.0 V; signal pins are limited by the datasheet, not by protocol marketing;
- the recommended control-input range and feature-page statement about 3.3 V logic need TI reconciliation. Drive at 1.8 V or through a validated interface until TI answers.

For `RClamp01012ZC.F`, one three-pin two-line device is proposed per differential pair. It has no supply or control. Placement and ground-return inductance are part of the measured structure; four fitted devices do not become a validated USB4/TB4 channel merely because the component page names those protocols.

## Vendor questions before schematic/layout freeze

### Texas Instruments

1. Supply current multiport Touchstone data for D0–D3 in A-selected, B-selected, off, unpowered and any intermediate states. State revision, reference impedance/plane, fixture removal, VCC/bias/temperature and valid frequency range.
2. Supply any package-only electrical model and model-to-datasheet correlation.
3. Reconcile the recommended control-input range with direct 3.3 V logic support at VCC=1.8 V.
4. Confirm whether break-before-make is guaranteed; document `EN`/selector sequencing, safe pulls and brownout/ramp behavior.
5. Confirm canonical production OPN/PCN status, prototype allocation/lead time and authorized source.
6. Review the proposed RF-only escape, decoupling, control and measurement states.

### Semtech

1. Confirm lifecycle/PCN/longevity and an authorized cut-tape prototype source for `RClamp01012ZC.F`.
2. Supply broadband multiport Touchstone data with package/pad/ground assumptions, bias, reference planes, valid frequency, lot and temperature corners.
3. Confirm the current package drawing, pin assignment, recommended land pattern, paste/stencil, MSL/reflow, ground-return implementation and pick/place tolerances.
4. Confirm intended one-device-per-pair connection and suitability against the exact mux main-lane voltage/common-mode limits.

## Decision

The exact names are now sufficiently precise for vendor questions and schematic experiments. They are not orderable/freezeable evidence. `GATE-LAB-001`, the channel-budget gate and sourcing/model access remain open.

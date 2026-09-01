# Validation plan

## Acceptance hierarchy

Passing a storage benchmark is not the same as proving electrical compliance. Evidence is accumulated in layers.

## 1. Baseline

- Record the current Thunderbolt topology with `system_profiler SPThunderboltDataType`.
- Record the current dock, display, storage, Ethernet and USB behavior without the KVM.
- Capture sleep/wake and power-cycle behavior.
- Keep exact cable models and lengths in the test record.

Baseline reported on 2026-09-01, but not yet accepted as measured evidence because the raw sanitized capture and full test context were not retained:

```text
Thunderbolt Dock 96W
Mode: USB4
Speed: 40 Gb/s
```

## 2. Access gate

Before integrated layout:

- obtain the current Intel controller reference design and firmware/NVM route;
- confirm two selectable upstream ports are supported;
- obtain the Infineon CYPD5235 Thunderbolt firmware/programming path;
- obtain component S-parameter models;
- obtain the real fabricator stack-up;
- simulate connector, ESD, mux, vias, traces and controller package together.

No-go if the project cannot reproduce the Intel/Infineon firmware path legally and technically.

## 3. Parallel proofs

### Signal proof

- For the first integrated prototype, close the reference-backed channel model and layout constraints, then collect desk-specific functional evidence. This is the fast path and does not establish electrical compliance.
- Build the RF-launch-only PCB-1A controlled-impedance mux coupon; it has no USB-C receptacle, CC/PD, router or laptop connection.
- Keep all four fast differential channels and both input branches measurable/selectable in every required powered, unpowered and unselected mux state.
- Use an adequately ported, calibrated VNA or lab-equivalent setup over the frequency span agreed before layout. TDR alone is limited to impedance/discontinuity unless the chosen system supports the required calibrated TDT/S-parameter conversion.
- Record calibration reference plane, launch/fixture models, thru and 2x-thru structures, de-embedding method, inactive-port terminations and raw single-ended/mixed-mode Touchstone data.
- Compare insertion loss, return loss, crosstalk and mode conversion against written pre-layout limits and simulation.

The coupon proves only the measured component/package/PCB channel. Live 40 Gb/s link training, plug orientation and certified-cable-vendor tests belong to the later protocol-capable integrated functional matrix, not PCB-1A.

PCB-1A RF measurement is optional before the first integrated order. Trigger it later when functional failures need channel diagnosis, model correlation is valuable, or the project is preparing stronger reliability/electrical claims. Lack of that measurement must remain explicit in the evidence ledger and public claims.

### PD/control proof

- Use appropriate PD development/reference hardware.
- Implement attach, orientation, VCONN, PD contract, detach and discharge.
- Verify Host A and Host B VBUS never conduct into one another.
- Add button, status log, display and current/voltage measurement.
- Fault-test overcurrent, overvoltage, absent host and interrupted switching.

## 4. Integrated functional matrix

For each host:

- both host-cable orientations;
- both downstream-cable orientations;
- cold boot, warm boot, sleep and wake;
- idle switch and switch during sustained NVMe writes;
- display reconnect at required resolution/refresh;
- simultaneous display, USB, Ethernet and PCIe storage load;
- dock and KVM power cycles;
- at least three certified cable vendors/lengths;
- 1,000 automated switching cycles;
- data-integrity verification after intentionally interrupted writes;
- no cross-host VBUS or CC leakage.

## 5. Affordable tools

The beginner-facing [validation-tool matrix](validation/tool-matrix.md) maps
each free, local, rented and lab tool to what it can and cannot prove.

- two known TB4 hosts;
- certified TB4 cables;
- existing OWC dock;
- fast TB4 NVMe enclosure;
- target display and normal peripherals;
- USB-C/PD analyzer;
- oscilloscope for CC/VBUS timing;
- programmable Type-C source/load;
- thermal camera;
- logic analyzer for MCU and PD-controller events.

## 6. Lab tools

- sufficiently ported VNA or equivalent calibrated lab setup for insertion loss, return loss, crosstalk and mixed-mode conversion across the agreed frequency span;
- TDR/TDT for impedance and discontinuity localization, with calibrated conversion only if the chosen setup demonstrably supports it;
- USB4/TB4 analyzer for discovery, training and tunnels;
- BERT and approved high-bandwidth oscilloscope for eye/jitter and receiver tolerance;
- USB4CV and Intel interoperability/certification testing.

Use a rental or compliance lab rather than buying this equipment for one project. See the [USB-IF approved USB4 equipment list](https://www.usb.org/usb4compliance).

## Claims gate

Do not claim reliable 40 Gb/s or use Thunderbolt branding based only on OS enumeration. Require repeated functional evidence plus appropriate electrical/interoperability testing.

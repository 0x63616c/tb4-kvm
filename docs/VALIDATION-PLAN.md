# Validation plan

## Acceptance hierarchy

Passing a storage benchmark is not the same as proving electrical compliance. Evidence is accumulated in layers.

## 1. Baseline

- Record the current Thunderbolt topology with `system_profiler SPThunderboltDataType`.
- Record the current dock, display, storage, Ethernet and USB behavior without the KVM.
- Capture sleep/wake and power-cycle behavior.
- Keep exact cable models and lengths in the test record.

Current baseline captured on 2026-09-01:

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

- Build a short controlled-impedance mux coupon.
- Keep both input branches measurable/selectable.
- Measure channel S-parameters if VNA access is available.
- Train a 40 Gb/s link using short certified TB4 cables.
- Test both plug orientations and multiple cable vendors.

The coupon proves only signal feasibility, not a compliant product topology.

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

- VNA/TDR for impedance, insertion loss, return loss and mode conversion;
- USB4/TB4 analyzer for discovery, training and tunnels;
- BERT and approved high-bandwidth oscilloscope for eye/jitter and receiver tolerance;
- USB4CV and Intel interoperability/certification testing.

Use a rental or compliance lab rather than buying this equipment for one project. See the [USB-IF approved USB4 equipment list](https://www.usb.org/usb4compliance).

## Claims gate

Do not claim reliable 40 Gb/s or use Thunderbolt branding based only on OS enumeration. Require repeated functional evidence plus appropriate electrical/interoperability testing.

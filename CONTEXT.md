# TB4 KVM domain glossary

## Connector and protocol

- **USB-C receptacle** — the 24-contact physical connector. It does not by itself promise USB4, Thunderbolt, charging wattage or any data rate.
- **USB4** — the packetized high-speed protocol family that can tunnel USB, DisplayPort and PCIe. Its electrical compliance points are not automatically the same as this project's PCB coupon reference planes.
- **Thunderbolt 4 (TB4)** — Intel's certified product requirements layered on USB4/TBT compatibility. A component page mentioning TB4 does not make this project or a coupon TB4 compliant.
- **Lane** — one bidirectional high-speed differential path in the project's abstract model. Always state whether a count refers to balanced differential lanes or single-ended VNA ports.
- **Differential pair** — two conductors carrying opposite-polarity versions of one high-speed signal. A four-port single-ended VNA measurement is needed to fully characterize one two-ended differential path.

## Product architecture

- **Host port domain** — one upstream computer-facing USB-C port's independently owned CC, PD, VBUS and VCONN behavior. Host A and Host B remain separate domains.
- **Downstream dock port domain** — the dock-facing USB-C port's independently owned CC, PD, VBUS and VCONN behavior.
- **Router** — the Thunderbolt/USB4 controller that terminates and creates protocol links. It is not interchangeable with a passive high-speed switch.
- **Mux** — an analog high-speed multiplexer that selects physical differential paths. It does not negotiate USB-C, USB4 or Thunderbolt.
- **Control plane** — the MCU, button, indicators, optional display and protected remote-pod interface that request and report switching without carrying high-speed data.

## Development artifacts

- **PCB-1A** — the measurement-only RF mux coupon. It has no USB-C receptacle, VBUS, CC, PD or router and cannot establish a USB4/TB4 link.
- **PCB-1B** — a future low-speed controller/UI prototype that excludes USB-C, PD, VBUS and high-speed lanes.
- **Integrated prototype** — the later two-host/one-dock board containing the reference-backed router, Type-C/PD/power domains, selector and control plane.
- **Channel budget** — a reference-plane-specific accounting model for allowed interconnect penalties, uncertainty and retained design margin. It is not a copied compliance mask.
- **Measurement-validity gate** — proof that calibration, fixture removal, uncertainty, repeatability, noise floor and retained raw evidence make a measurement trustworthy. It is separate from product performance acceptance.
- **Order-ready** — an exact immutable manufacturing package has passed every documented pre-order technical/review/DFM gate and awaits the owner's explicit order approval. It does not mean fabrication has been authorized.
- **Validated** — all documented acceptance criteria for the exact claim and revision passed with retained evidence. See the full evidence vocabulary in `AGENTS.md`.

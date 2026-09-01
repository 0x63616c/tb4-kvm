# PCB-1A mixed-mode measurement method

Status: `PROPOSED_UNBOOKED`. This is an engineering-characterization plan, not USB4 or Thunderbolt compliance.

The machine-readable measurement plan is [`design/pcb1a-measurement-matrix.json`](../design/pcb1a-measurement-matrix.json). The separate Draft 2020-12 channel-budget contract keeps the real Prototype A allocation record `BLOCKED`; its only closed record is an explicitly `SYNTHETIC_TEST_ONLY` evaluator fixture, not a product limit. `npm run verify:pcb1a` checks the measurement plan, and `npm run verify:channel-budget` checks that contract. Neither structural check can replace a VNA measurement or lab review.

## What PCB-1A is measuring

PCB-1A is an RF-only coupon around one four-pair 2:1 high-speed mux. It contains no USB-C receptacle, CC, PD, VBUS or router and cannot establish a USB4 link.

The full mux exposes 12 balanced ports—four Host A pairs, four Host B pairs and four common pairs—or 24 single-ended conductors. A practical first campaign measures one differential path at a time.

| Available VNA ports | Defensible scope |
| --- | --- |
| 4 single-ended | One two-balanced-port path: loss, return loss, mode conversion, and sequential isolation/coupling terms |
| 6 single-ended | Complete three-balanced-port matrix for one mux lane |
| 8 single-ended | Two lanes simultaneously for direct pairwise NEXT/FEXT |
| 16 single-ended | Four selected lanes simultaneously while the inactive bundle is externally terminated |
| 24 single-ended | Complete mux network including both host bundles and common bundle |

Minimum: a calibrated four-port VNA reaching 20 GHz. Preferred: 26.5 GHz and eight or more ports for stronger pairwise crosstalk evidence. A 20 Gb/s NRZ lane has a 10 GHz Nyquist frequency; reaching 20 GHz captures materially useful harmonic and discontinuity behavior.

## Calibration and reference planes

1. Perform a full four-port SOLT or ECal calibration at the phase-stable coax cable ends.
2. Do not move calibrated cables. Record the VNA, firmware, options, calibration module/kit, cable and adapter identities, connector torque, source power and sweep settings.
3. Retain the calibrated raw fixture+DUT single-ended Touchstone file before any correction.
4. Fabricate a symmetric 2x-thru for every materially different launch/escape geometry. It must use the same stack-up, copper, soldermask, vias, connectors and trace geometry as the DUT fixture.
5. Extract left and right fixtures using IEEE 370 2x-thru or a lab-accepted equivalent. The plain no-mux thru is a comparator for process/launch loss, not an extraction standard.
6. De-embed only to the PCB package lands. Do not claim a silicon-die reference plane without a vendor package model that supports it.
7. Include a plain no-mux thru as a comparator for launch/PCB process loss; do not treat it as an extracted network unless the lab documents that method.
8. Validate de-embedding with the residual thru, raw-versus-corrected comparison, reciprocity, passivity, causality and time-domain impedance continuity.

Primary methods: [IEEE 370-2020](https://standards.ieee.org/ieee/370/6165/), [Rohde & Schwarz fixture characterization](https://www.rohde-schwarz.com/us/applications/accurate-test-fixture-characterization-and-de-embedding_56280-1271617.html), [Keysight de-embedding](https://www.keysight.com/zz/en/assets/7018-06806/application-notes/5980-2784.pdf), and [scikit-rf IEEE 370 examples](https://scikit-rf.readthedocs.io/en/latest/examples/networktheory/IEEEP370%20Deembedding.html).

## Port termination and state matrix

Every unmeasured single-ended conductor needs a documented, repeatable RF termination. Matched 50 Ω single-ended loads approximate a 100 Ω differential termination when connected appropriately, but they do not represent an unplugged open connector branch. Measure both matched and open inactive-branch cases.

Required nominal states:

- unpowered;
- powered with all paths Hi-Z only if the selected device's authoritative datasheet/model explicitly supports that state;
- A selected with B matched;
- B selected with A matched;
- A selected with B open;
- B selected with A open.

Add break-before-make and intermediate states only after TI documents their existence and control sequence. Record supply voltage/current, state pins, termination map and temperature for every file.

For each D0–D3 pair and selected state, collect insertion loss (`Sdd21/Sdd12`), return loss (`Sdd11/Sdd22`), group delay, mode conversion (`Sdc/Scd`), common-mode terms, inactive-path isolation, pairwise NEXT/FEXT, phase/lane skew, reconnection repeatability and the measurement-system noise floor.

## Starting sweep—not a compliance mask

- start frequency: 10–50 MHz;
- stop: 20 GHz minimum, 26.5 GHz preferred;
- at least 1601 uniformly spaced points;
- 1 kHz IF bandwidth for ordinary loss/return-loss work;
- narrower IF bandwidth and averaging for isolation/crosstalk near the noise floor;
- source power limited to vendor-supported small-signal conditions.

The [USB-IF USB4 specification library](https://www.usb.org/document-library/usb4r-specification) is the canonical current source context (use the applicable released CTS, including 1.04 where applicable). Its masks apply at defined USB4 reference planes. They cannot be copied onto this coupon's mux-land reference planes.

## Raw evidence contract

Retain raw single-ended Touchstone, 2x-thru, plain-thru, extracted fixture, de-embedded and explicitly mapped mixed-mode data. Add a port/polarity map; VNA/calibration/cable manifest; mux state, inactive-load, voltage, current and temperature log; sweep settings; noise-floor and reconnect captures; board serials; hashes; and reproducibly generated plots.

Use the [Touchstone 2.1 specification](https://ibis.org/touchstone_ver2.1/touchstone_ver2_1.pdf) for explicit mode/port ordering. Validate syntax with [IBIS TSCHK2](https://ibis.org/tschk2/v200/tschk2.htm). Free [scikit-rf](https://scikit-rf.readthedocs.io/) can perform conversions, IEEE 370 de-embedding and quality checks after real measurements exist.

## What can be done for free

Free now: fixture topology, port map, state matrix, channel-budget worksheet, Touchstone parser, mixed-mode conversion, de-embedding scripts, reciprocity/passivity/causality checks, TDR transforms and evidence manifests.

Paid, rented or borrowed: the coupon, precision launches/loads, calibrated 20/26.5 GHz four-port VNA, phase-stable cables, 8+ port test set or characterized RF switching, temperature testing, and eventual USB4/TB4 BERT/scope/analyzer access. The [USB-IF approved equipment list](https://www.usb.org/usb4compliance) demonstrates why formal compliance is a separate later activity.

## Pass/fail policy

No numeric loss, return-loss, crosstalk, isolation, mode-conversion, impedance or skew limit is approved yet. Those limits must come from a complete end-to-end channel budget that includes connectors, cables, PCB routes/vias, mux guarantees, manufacturing/measurement uncertainty and retained margin.

Product/channel performance limits remain empty until that budget exists. A separate **measurement-validity gate** is proposed so bad data cannot be labeled measured merely because no TB4 mask exists:

- the lab must declare the frequency band over which its method is valid and accept the fixture electrical requirements and time/frequency-domain quality criteria;
- residual self-de-embedding must remain within ±0.1 dB insertion loss and ±1° phase over that accepted band, using the IEEE 370 residual check;
- the uncertainty model must report expanded uncertainty with coverage factor `k=2`;
- at least three independent disconnect/reconnect measurements must use the covariance-aware combined uncertainty of the two observations; use `U_combined = sqrt(U_i² + U_j² + 2ρU_iU_j)` when correlation `ρ` is known, or a documented conservative sum when it is not. Accept only when `|xᵢ − xⱼ| ≤ U_combined`;
- the provisional measurement-to-system-noise-floor margin is at least 10 dB; the lab must accept or replace this criterion before use; and
- resonance/state-asymmetry detection criteria, absolute repeatability caps and the validated band must be filled in rather than guessed.

These are metrology-quality criteria, not USB4/TB4 channel limits. The machine contract keeps `measurementValidityPassAuthorized=false` until a named lab reviews the method and fills every `null` criterion. Only then can conforming evidence be labeled `MEASURED — budget pending`, never `TB4 compliant`.

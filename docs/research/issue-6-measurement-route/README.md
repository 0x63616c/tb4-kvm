# Issue #6 — optional PCB-1A measurement routes

Capture date: 2026-09-01 (America/Los_Angeles). Status: `PROPOSED_BLOCKED`.

This is an optional diagnostic/evidence route for PCB-1A, not a prerequisite for the accepted prototype-first path and not a USB4/TB4 compliance result. The governing contract is [`docs/PCB-1A-MEASUREMENT-METHOD.md`](../../PCB-1A-MEASUREMENT-METHOD.md): calibrated four-port VNA (20 GHz minimum, 26.5 GHz preferred), phase-stable cables, symmetric 2x-thru, fixture removal to mux lands, mixed-mode conversion, documented termination/state matrix, uncertainty and noise-floor evidence, raw Touchstone retention, and an openly publishable evidence package.

No vendor was contacted, no quote was requested, and no capability, price, availability, accreditation scope, or publication right is inferred from a product page. The routes below are leads whose exact configuration and contract remain to be qualified.

## Current route candidates

| Route | Official evidence observed | Contract fit | State |
| --- | --- | --- | --- |
| Granite River Labs (staffed SI lab) | GRL advertises bench VNA/TDR, fixture de-embedding, S-parameter extraction from boards/connectors/cables, and custom fixture architecture/manufacture/validation. [Official service page](https://www.graniteriverlabs.com/en-us/engineering-services/signal-power-integrity-test-analysis) | Strongest staffed lead. Frequency, port count, calibration kit/cables, IEEE 370 method, uncertainty (`k=2`), state/termination handling, raw-file delivery and open-publication terms are not stated on the page. | `PROPOSED_BLOCKED` |
| Electro Rent + Keysight P5025A configuration | Electro Rent lists a rentable P5025A-402 as 4-port, 100 kHz–26.5 GHz and shows Keysight S97007A automatic fixture-removal options; availability is confirmed only on quote. [Official rental listing](https://www.electrorent.com/us/products/rf-and-microwave-network-analyzers/modular-vna/keysight-technologies/p5025a/01t1O00000CkjW0QAJ) | Meets instrument bandwidth/port minimum on paper and supplies a possible self-operated route. It does not establish a qualified calibration kit, phase-stable cables, 2x-thru extraction, mixed-mode/IEEE 370 workflow, uncertainty, engineering support, or data/publication terms. | `PROPOSED_BLOCKED` |
| R&S ZNA26 + ZN-Z86 route | R&S lists 4-port ZNA26 at 10 MHz–26.5 GHz and its specification lists ZN-Z86 switching from 4 VNA ports to as many as 24 test ports. R&S also documents fixture characterization/de-embedding on ZNA/ZNB instruments. [ZNA product page](https://www.rohde-schwarz.com/us/products/test-and-measurement/vnas/rs-zna-vector-network-analyzers_63493-551810.html), [ZNA specification](https://scdn.rohde-schwarz.com/ur/pws/dl_downloads/pdm/cl_brochures_and_datasheets/specifications/5215_4652_22/ZNA_specs_en_5215-4652-22_v2100.pdf), [fixture/de-embedding note](https://www.rohde-schwarz.com/us/applications/accurate-test-fixture-characterization-and-de-embedding_56280-1271617.html) | Instrument and switching are plausible for sequential expansion, but a switch matrix is not evidence of a simultaneously calibrated 24-port measurement. Rental/borrow availability, calibration accessories, switch repeatability/isolation, state control, uncertainty and open data terms remain unverified. | `PROPOSED_BLOCKED` |

Element also advertises network analyzers and RF capability from 9 kHz to 40 GHz and beyond, with ISO/IEC 17025 facilities, but its public page describes broad RF/wireless testing rather than this PCB-1A fixture contract. It is therefore a staffed lead only, not a qualified route: [Element RF services](https://www.element.com/connected-technologies/wireless-testing/radio-frequency-rf-testing-services).

## What is and is not established

The official sources establish that current commercial instruments and staffed services exist near the required bandwidth. They do not establish that any candidate will execute the complete contract. In particular, no source reviewed here proves all of the following together:

- four or more phase-coherent ports through 26.5 GHz with the required calibration module, torque-controlled cables/adapters and traceable verification;
- symmetric PCB-1A-compatible 2x-thru fabrication or acceptance and IEEE 370 fixture extraction to the mux package lands;
- all required matched/open inactive-branch states, six nominal mux states, mixed-mode port ordering, NEXT/FEXT and isolation captures;
- residual de-embedding, repeatability, covariance-aware uncertainty with `k=2`, and the proposed 10 dB noise-floor margin; or
- delivery rights for raw single-ended/mixed-mode Touchstone, fixture files, plots, scripts, hashes and a public repository release.

The contract therefore remains `BLOCKED` pending a named route and written scope. Instrument headline bandwidth, automatic fixture-removal marketing, ISO accreditation, or an online rental listing cannot substitute for the measurement-validity gate.

## Safe qualification packet (owner action later)

If the optional route becomes worthwhile after a functional failure, model-correlation need, or stronger electrical evidence decision, the owner may ask a candidate for a written statement covering the exact PCB-1A coupon revision, 20/26.5 GHz band, port count and coherence, calibration kit/cables, 2x-thru and fixture-removal method, reference plane, state/termination matrix, mixed-mode ordering, raw output formats, uncertainty/noise-floor/repeatability reporting, schedule and price. Ask separately for permission to publish raw and derived evidence; do not upload vendor or client material without that permission.

The owner—not this research artifact—must authorize external contact, quotes, rentals, data terms, and valuable-equipment exposure. No route is order-ready or booked. This issue can close positively only when one route has written scope satisfying the contract, an independent review accepts the method, and the owner decides the optional cost is justified. Until then, status is `PROPOSED_BLOCKED`; this does not block Prototype A.

## Sources and method context

The project method links [IEEE 370-2020](https://standards.ieee.org/ieee/370/6165/) and the [Touchstone 2.1 specification](https://ibis.org/touchstone_ver2.1/touchstone_ver2_1.pdf). Free [scikit-rf](https://scikit-rf.readthedocs.io/) can process data after a real campaign, but software availability does not prove the instrument or lab method. The machine-readable candidate record is [`design/measurement-route/inventory.json`](../../../design/measurement-route/inventory.json), checked by [`design/measurement-route/validate.mjs`](../../../design/measurement-route/validate.mjs).

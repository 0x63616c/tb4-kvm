# Owner model/source request packet — issue #5

Status: `DRAFT — DO NOT SUBMIT`
Prepared: 2026-09-01
Scope: PCB-1A measurement-only coupon. No purchase, fabrication, topology freeze, or USB4/TB4 compliance claim is authorized by this packet.

Use the vendor's official support/sales channel. Attach no credentials, tokens, private messages, or other secrets. Do not accept a click-through license, NDA, quote, substitution, or purchase without owner review.

## TI — exact `TMUXHS4512IRETT`

Subject: PCB-1A model, package, lifecycle and prototype-source request — TMUXHS4512IRETT

We are evaluating Texas Instruments `TMUXHS4512IRETT` for an RF-only, measurement coupon. Please confirm, in writing:

1. Exact OPN `TMUXHS4512IRETT`, alias `TMUXHS4512IRETT.A`, industrial grade −40…125 °C, RET WQFN 40 pins, 3 mm × 6 mm, 0.4 mm pitch; confirm `RETT` means 250-piece SMALL T&R and distinguish `IRETR` (3,000-piece LARGE T&R). Please provide the current package drawing, pin table, recommended land/stencil pattern and revision.
2. A legally usable, redistribution-permitted broadband multiport model covering D0–D3 and the A/B/common paths. Touchstone 2.x preferred; state whether it is measured or modeled and provide model revision/date, port order/polarity, impedance, frequency span/step, and validity limits.
3. Reference planes and fixture removal: identify whether planes are silicon/package pins, package lands, or evaluation-board connectors; provide fixture, launch, probe, calibration and de-embedding details and the correlation procedure.
4. Data for selected A, selected B, all paths Hi-Z/disabled, unpowered/IOFF, and any intermediate or break-before-make state. Specify all inactive-port terminations and control-pin levels for every state.
5. Supply voltage, common-mode/differential stimulus, control bias, ambient/junction temperature, process/voltage/temperature or lot corners, and any model exclusions. State whether the model covers sideband paths needed by the coupon.
6. Current lifecycle, PCN/change-notification and longevity route for the exact OPN; identify whether any model or package collateral is restricted and provide the applicable use/redistribution terms.
7. Authorized prototype allocation: current availability, minimum order, lead time, source/channel, lot/date-code traceability and whether cut tape/samples are available for the exact `IRETT` OPN. No substitution is authorized; list alternatives separately and do not ship one without written approval.

Also confirm whether the existing public `TMUXHS4412IRUAT` `SLAM352.ZIP` model is applicable to `TMUXHS4512IRETT`. We will treat it as non-applicable unless TI explicitly confirms electrical/package/state equivalence and the model reference-plane/condition requirements above.

Official references: https://www.ti.com/product/TMUXHS4512/part-details/TMUXHS4512IRETT and https://www.ti.com/lit/gpn/TMUXHS4512

## Semtech — exact `RClamp01012ZC.F`

Subject: PCB-1A model, package, lifecycle and prototype-source request — RClamp01012ZC.F

Please confirm, in writing, for exact order code `RClamp01012ZC.F`:

1. Current exact OPN, sole order code status, package name/outline, 3-lead assignment, exposed/ground connection, recommended land pattern, stencil/paste, assembly limits and document revisions. Please resolve any distributor description that calls this a 2-pin/DFN-2 part; manufacturer data controls.
2. A legally usable broadband multiport Touchstone or equivalent model including package/pad/ground-return parasitics. State reference planes, port order/polarity, impedance, frequency span, fixture removal, line bias/termination, and model validity limits.
3. Model conditions and corners: unpowered/passive state, voltage/common-mode range, temperature, process/lot or other PVT corners, and whether the model is measured or extracted. Identify limitations for one device protecting one differential pair.
4. Current lifecycle, PCN/change-notification and longevity route; current datasheet/package/land-pattern revisions; and terms permitting use, modification and redistribution in an open-source PCB simulation/research package.
5. Authorized prototype source: sample/cut-tape availability, minimum quantity, lead time, source/channel and lot/date-code traceability. No substitution is authorized; list alternatives separately and do not ship one without written approval.

Official reference: https://www.semtech.com/products/circuit-protection/usb/rclamp01012zc

## RF launches — Samtec and Amphenol RF

Subject: PCB-1A calibrated RF-launch model and prototype-source request

For the exact proposed launch, identify which request applies and do not substitute a similar connector:

- Samtec `SMA-J-P-H-ST-EM1`; or
- Amphenol RF `901-10511-1`.

Please provide:

1. Exact OPN/configuration, current series print/customer drawing revision, footprint/land pattern, board-edge and trace assumptions, plating/materials, mating connector requirements and mechanical tolerances.
2. A legally usable broadband EM/HFSS/Touchstone model suitable for PCB channel simulation. State reference plane, port definition, de-embedding/fixture removal, board thickness/stack-up/soldermask/copper assumptions, frequency span, mesh/model revision, termination and temperature/material corners. If only a model by request is available, state the request path and use/redistribution terms.
3. Current lifecycle/PCN/longevity route and all access restrictions. For Amphenol, confirm whether Customer Drawing is public while STP/HFSS collateral is account-gated. For Samtec, confirm whether the EM1 configuration is available to a new customer and identify an approved alternative only as a separately reviewed candidate.
4. Authorized prototype allocation: source/channel, minimum order, lead time, current qualitative availability, lot/traceability and mating hardware. No substitution is authorized; do not ship an alternative without written approval.
5. Confirm whether the manufacturer will support a coupon-specific launch recommendation for the selected fabricator stack-up and lab calibration/de-embedding structures.

Official references: https://www.samtec.com/products/sma-j-p-h-st-em1 and https://www.amphenolrf.com/en-us/part/901-10511-1/4021/

## Owner-only acceptance checklist

- [ ] Verify sender/channel is an official manufacturer or authorized distributor representative.
- [ ] Preserve the received document/model files, revision/date, hashes, access terms and source URL without publishing restricted collateral.
- [ ] Confirm every exact OPN, package/pin/land revision and no-substitution rule.
- [ ] Confirm model reference planes, port order, fixture removal, impedance, frequency, states, terminations, bias and PVT/lot corners.
- [ ] Obtain written permission for repository use, simulation, modification and redistribution; do not infer permission from a download button.
- [ ] Confirm authorized prototype source, quantity, lead time and traceability; do not purchase yet.
- [ ] Have an independent signal-integrity reviewer assess the model/package/launch evidence and record findings under `docs/reviews/`.
- [ ] Update the issue-5 inventory only after evidence is independently checked. Until all fields pass, retain `BLOCKED` and do not freeze PCB-1A.

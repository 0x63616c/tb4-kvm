# Independent PCB-1 and manufacturing audit

- Date: 2026-09-01
- Reviewer role: independent parts/manufacturing subagent
- Source state: pre-Git research package
- Disposition: **PCB-1A coupon recommended; integrated board rejected**

## Recommendation

PCB-1A should be a measurement-only high-speed mux coupon with all four fast differential paths, both branches, lab-agreed launches, thru/2x-thru de-embedding structures, optional/DNP ESD footprints, clean external 1.8 V and static controls. It has no USB-C CC, VCONN, VBUS, PD controller, router, MCU or display.

A separate low-speed MCU/UI board may proceed in parallel. A CYPD5235 PD/power board is a later reference-backed experiment. The integrated JHL9440/CCG5/mux KVM is a no-go now.

## Blocking evidence for PCB-1A

- exact mux OPN and public S-parameter/package models;
- lab agreement on connector, fixture, calibration and de-embedding method;
- written frozen PCBWay stack-up including named laminate/construction, Dk/Df basis, glass style, copper type/roughness and solder mask;
- trace geometry recalculation and pre/post-layout channel simulation;
- written pass/fail limits and an impedance/TDR report requirement;
- available VNA/TDR or lab booking before fabrication.

## Manufacturing conclusions

PCBWay appears suitable to quote for the coupon and ordinary low-speed board. Its generic controlled-impedance and BGA capabilities are not project acceptance evidence. CYPD5235 is within published generic assembly capability but still needs job-specific DFM, MSL, stencil and X-ray acceptance. JHL9440 suitability cannot be assessed without the gated package/layout material.

## Parts corrections

- `JHL9440 + CYPD5235 + TMUXHS4512` is unproven by public primary sources.
- PI3DBS16412 is TB3-rated manufacturer evidence plus TB4-product teardown precedent, not primary TB4 validation.
- PI2DBS32412 is a newer TB4 research alternative.
- CCG5 may make separate USB2/SBU protection/switch parts redundant; follow the exact reference architecture.
- “Reference-design PFET/eFuse stages” is an unresolved subsystem, not a BOM line.

## Author response

PCB-1 definition and candidate-parts document were split by evidence stage. The coupon is the recommended first fabrication, but it remains no-go without a measurement route and frozen stack-up. Integrated parts remain explicitly gated.

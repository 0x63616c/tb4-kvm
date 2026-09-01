# Issue #5 PCB-1A parts evidence

Capture date: 2026-09-01 (America/Los_Angeles). Evidence state: `BLOCKED`.

This is a bounded sourcing/model audit for the measurement-only PCB-1A coupon. It does not freeze a BOM, authorize a purchase, or establish USB4/TB4 compliance. Distributor pages are used only for dated availability snapshots; manufacturer pages and datasheets are authoritative for identity and electrical/package claims.

## Result

Issue #5 positive exit criteria are **not met**. The research candidates are identifiable, but no candidate has the complete required set of an authoritative identity/pin/land record, lifecycle/PCN route, legally usable broadband model with reference planes/states/corners, authorized prototype source, and fitted/DNP disposition.

| Function | Exact candidate | What closes | Blocking evidence | Disposition |
| --- | --- | --- | --- | --- |
| Four-pair mux | TI `TMUXHS4512IRETT` (same as `TMUXHS4512IRETT.A`) | Active industrial identity, 40-pin RET WQFN, 3 x 6 mm / 0.4 mm, -40...125 °C datasheet/order data, public land-pattern drawing | TI product page exposes no S-parameter model; TI direct stock says out of stock; no written multi-state model/reference-plane/corner package | `PROPOSED`; prototype source and model request required; do not freeze |
| Optional lane ESD | Semtech `RClamp01012ZC.F` | Manufacturer product identity, 3-pin DFN, 0.62 x 0.32 x 0.25 mm, 0.17 pF typ/0.21 pF max, USB4/TB4 application claim | No public broadband model, pin/land file, lifecycle/PCN record, or written reference-plane/corner data; distributor search has a package-description conflict and is not authority | `DNP` comparison candidate only |
| RF launch | Samtec `SMA-J-P-H-ST-EM1` | Manufacturer identifies 50 ohm edge-mount family and 18 GHz base performance | Samtec says EM-solver models are available by request; no public legal broadband launch model/reference plane/corners; current page limits this configuration to existing customers and directs new customers to alternatives; board stack-up/launch tuning remains job-specific | `PROPOSED`; prototype source blocked; qualify with lab/fabricator |
| RF launch alternative | Amphenol RF `901-10511-1` | Exact official page identifies active 50 ohm end-launch jack, 26.5 GHz, 0.062 in PCB; Customer Drawing is publicly downloadable | STP and HFSS 3D component are account-gated; public drawing is not a broadband model; no public/legal broadband reference-plane/corner/terms package; prototype stock not captured from authorized source | `DNP` alternative until model/terms/source close |

## Required next actions

1. Ask TI for the complete multiport Touchstone/package model for D0-D3 in all required states and the legal redistribution terms; obtain written prototype allocation or an authorized distributor line for the exact industrial `IRETT` OPN.
2. Ask Semtech for a current datasheet/package pinout and land pattern, lifecycle/PCN/longevity statement, broadband model and authorized cut-tape/sample route for `.F`.
3. Ask the selected launch manufacturer for an EM-solver/broadband model whose reference plane and board assumptions are explicit. Obtain lab acceptance of the launch, mating hardware, calibration/de-embedding structure and PCB stack-up.
4. Keep all three candidates unfrozen. If any vendor cannot provide the required model/terms, select a replacement only after the replacement itself satisfies the same evidence fields; otherwise the gate remains blocked.

## Sources (accessed 2026-09-01)

- TI product page: https://www.ti.com/product/TMUXHS4512 (active status, product details, package/pins, CAD link, and absence of a public simulation-model entry).
- TI exact order page: https://www.ti.com/product/TMUXHS4512/part-details/TMUXHS4512RETT (exact OPN, alias, carrier, stock and quality data).
- TI exact industrial order page: https://www.ti.com/product/TMUXHS4512/part-details/TMUXHS4512IRETT (the correct prototype candidate: `I` selects -40...125 °C; `RETT` is the 250-piece small tape-and-reel carrier; `.A` is an identical alias; TI reports both exact `IRETT` and 3,000-piece `IRETR` out of stock at capture).
- TI datasheet / land-pattern drawing: https://www.ti.com/lit/gpn/TMUXHS4512
- TI PCN record surfaced by Digi-Key document index: https://mm.digikey.com/Volume0/opasdata/d220001/medias/docus/6538/PCN20250204003.1.pdf (affected OPN list and continuity-of-supply notice; retain as a PCN lead, not a substitute for TI's current PCN route).
- Semtech product page: https://www.semtech.com/products/circuit-protection/usb/rclamp01012zc (identity, electrical headline, package/order code, application claim and manufacturer purchase route).
- Semtech current product guide: https://www.semtech.com/uploads/design-support/CP-Circuit_Protection-Product-Guide-April2026-2.pdf (package naming context; does not supply a part-specific broadband model).
- Samtec manufacturer product page: https://www.samtec.com/products/sma-j-p-h-st-em1 (edge-mount family, 50 ohm/18 GHz, customer-restriction notice, CAD disclaimer and EM-solver-model request path; no volatile quantity retained).
- Amphenol RF exact product page: https://www.amphenolrf.com/en-us/part/901-10511-1/4021/ (active identity and 50 ohm/26.5 GHz/0.062 in PCB specifications; Customer Drawing is public while STP and HFSS 3D component remain account-gated).
- Authorized distributor snapshots: https://www.digikey.com/en/products/detail/texas-instruments/TMUXHS4512IRETR/25821308 ; https://www.mouser.com/ProductDetail/Semtech/RClamp01012ZC.F ; https://www.digikey.com/en/products/detail/samtec-inc/SMA-J-P-H-ST-EM1/17278900 . These identify the exact industrial `IRETR` (3,000-piece carrier), Semtech `.F`, and Samtec launch lines; no volatile quantity, price or lead-time claim is retained. No exact industrial `IRETT` prototype-stock snapshot was captured.

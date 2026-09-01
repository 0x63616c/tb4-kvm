# Issue #5 bounded replacement search

Capture date: 2026-09-01. Scope was limited to major manufacturer pages for four-differential-channel 2:1 muxes and board-edge RF launches. Existing `TMUXHS4512IRETT`, `RClamp01012ZC.F`, `SMA-J-P-H-ST-EM1`, and `901-10511-1` records were not repeated here.

## Near-match muxes

### TI `TMUXHS4412IRUAT` — blocked replacement candidate

TI identifies this as an active 4-channel 20-Gbps 2:1/1:2 passive mux/demux in 42-pin RUA WQFN, with 250-piece small tape-and-reel packaging and -40...105 °C operation. TI publicly provides `SLAM352.ZIP`, a 4-port Touchstone file described as an average ON channel. The file readme defines differential ports as single-ended 1/3 and 2/4, but does not state a PCB/package reference plane, switch-state matrix, supply/bias, temperature/lot corners, or fixture/de-embedding method. The model therefore cannot satisfy the PCB-1A model gate as-is. The RUA 42-pin package also requires a new pin/land/escape review; it is not a drop-in replacement for the 40-pin RET mux.

Sources:

- Manufacturer product page: https://www.ti.com/product/TMUXHS4412 (active status, four channels, 20 Gbps, RUA 42-pin package, model download).
- Exact small-carrier OPN: https://www.ti.com/product/TMUXHS4412/part-details/TMUXHS4412IRUAT (active `IRUAT`, RUA 42, 250-piece SMALL T&R, -40...105 °C; TI page captured out of stock).
- Public model: https://www.ti.com/lit/zip/slam352 (Touchstone and readme; model is an average ON channel, not a state/corner/reference-plane package).

Disposition: `BLOCKED_REPLACEMENT_SELECTION`. Ask TI for the model’s reference plane/fixture removal, all OFF/A/B states, supply/bias/temperature corners, legal redistribution terms, and current exact `IRUAT` prototype allocation before any schematic substitution.

### Diodes `PI2DBS32412EQ` — blocked replacement candidate

Diodes’ official page identifies an active automotive-grade 4-channel 2:1 mux/demux, up to 32 GBd/s, with USB4 Gen2x1/Gen3x1 and Thunderbolt 5 application claims, 38-pin ZTFA UQFN, and -40...105 °C. The datasheet is request-gated from the official page; no public broadband S-parameter/IBIS-AMI/package model with reference planes, states and corners was found. Its marketing bandwidth cannot substitute for that missing model. No authorized prototype stock/source was captured.

Sources:

- Manufacturer product page: https://www.diodes.com/part/view/PI2DBS32412EQ (identity, package, electrical headline, lifecycle and request-gated datasheet).
- Manufacturer product showcase: https://www.diodes.com/assets/product-showcases/1.8V-32-Gbps-Four-Differential-Channel-21-Mux-/Demux-Switch.pdf (family/package overview; not a broadband model).

Disposition: `BLOCKED_REPLACEMENT_SELECTION`. Ask Diodes for the exact ZTFA pin/land package, all mux states and terminations, broadband model with reference planes and PVT corners, legal terms, lifecycle/PCN route, and an authorized cut-tape/sample source.

## RF-launch replacement search result

No additional launch candidate met the positive criteria during this bounded search. Manufacturer launch pages generally provide nominal impedance/frequency, drawings or CAD, while the PCB-specific EM response depends on board thickness, stack-up, soldermask, trace width and ground-via geometry. A launch cannot be selected on a 20/26.5 GHz headline alone. The existing Samtec and Amphenol records remain the only named candidates, both blocked on an explicit, legally usable broadband model/reference-plane/condition package and complete prototype-source evidence.

## Gate conclusion

No replacement candidate meets all issue #5 positive exit criteria. `positiveExitCriteriaMet` remains false. These findings do not unblock topology, schematic freeze, layout, purchase, or fabrication.

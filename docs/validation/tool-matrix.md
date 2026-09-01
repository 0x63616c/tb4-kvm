# TB4 KVM validation-tool matrix

Status: `PROPOSED`

As of: 2026-09-01

Scope: the externally powered, two-host/one-dock Thunderbolt 4 KVM in this repository.

This is a tool-selection guide, not a compliance declaration. A tool proves only the claim it measures, with its stated setup, calibration, software version and limits. Keep raw captures, source/model hashes, configuration and tool versions with each result. Use the repository evidence states (`PROPOSED`, `MODELED`, `REVIEWED`, `FABRICATED`, `MEASURED`, `VALIDATED`, `BLOCKED`) rather than treating a green program exit as “validated.”

## The short answer

Start with free/local checks: KiCad ERC/DRC, ngspice, firmware host/unit/fuzz tests, CAD/mesh/slicer checks, and scikit-rf once data exists. Add openEMS only when a credible stack-up and connector/package model makes an RF model useful. On the first powered prototype add a USB-C/PD analyzer, current-limited supplies/loads, an oscilloscope and thermal observations. Use a rented calibrated VNA/TDR for a PCB-1A coupon or channel diagnosis. Late in the project, use an approved USB4CV/protocol platform and a compliance lab/BERT/scope for the claims that require them.

No free software, OS enumeration, functional throughput test, generic oscilloscope, or uncalibrated VNA establishes USB4/TB4 compliance. No software-only tool establishes electrical safety, isolation, or that Host A VBUS cannot conduct into Host B VBUS. USB-IF identifies USB4CV, approved platforms, electrical test specifications, and approved scopes/BERTs as distinct compliance resources; treat those as a late, external gate, not an early design shortcut: [USB-IF USB4 compliance](https://www.usb.org/usb4compliance), [USB-IF compliance tools](https://www.usb.org/compliancetools).

## Matrix

| Tool/family | Cost and timing | Can prove (with the recorded setup) | Cannot prove | Project entry point |
|---|---|---|---|---|
| KiCad ERC/DRC/CLI | Free/local; now and every revision | Schematic connectivity/electrical-rule and PCB geometry/rule violations selected by configured rules; repeatable reports/exit codes | USB4/TB4 protocol or SI, PD timing, thermal behavior, isolation, safety | As soon as schematic/PCB exist; make reports a review input |
| ngspice | Free/local; before PCB review | Modeled DC/AC/transient behavior, corners and sensitivity for stated models, sources and loads | Unmodeled parasitics/layout, actual controller firmware, USB4, safety | Once power/PD topology and limits are written; correlate to bench |
| Firmware host/unit/fuzz tests | Free/local; before valuable equipment | Deterministic state transitions, parser/error/watchdog behavior, tested corpus and regressions | Pin voltages, VBUS/CC isolation, analog timing, PD/USB4 conformance, router NVM | Before live hardware; hardware-in-loop only current-limited |
| openEMS | Free/local; optional pre-layout | Comparative 3-D FDTD fields/ports for stated geometry, materials, mesh and boundaries | Fabricated-board truth without validated models; compliance, receiver tolerance, safety | Only when stack-up/models and limits exist; use for risk/model correlation |
| scikit-rf + Touchstone | Free/local; when RF files exist | Reproducible S-parameter import, conversion, plots, derived IL/RL/crosstalk/mixed-mode calculations | Calibration accuracy, representative DUT, live link training or compliance | With solver/VNA output and complete reference-plane metadata |
| Mechanical CAD/mesh/slicer | Free/local; after released PCB datums | Parametric regeneration, dimensions/clearances, mesh and export/import/slice checks | Printed fit/strength/thermal/electrical behavior; geometry-only 3MF is not print acceptance | After connector/PCB datums; print and inspect a fit-check |
| USB-C/PD analyzer | Paid/rental; first powered PD prototype | CC/VBUS/VCONN traces, PD messages/contracts, attach/detach/orientation within coverage | USB4 high-speed electrical compliance, all analog safety faults, out-of-range behavior | Before host/dock exposure; current-limit and fixture it |
| Oscilloscope + controlled load | Paid/rental; first power prototype | Measured VBUS/CC/VCONN waveforms, ripple, ramps, transients and timing under stated probes/load | USB4 compliance without CTS method/fixtures; protocol layer; safety certification | Before live host/dock testing; preserve raw waveforms |
| VNA/TDR | Paid/rental; PCB-1A/integrated diagnosis | Calibrated S-parameters and/or impedance/discontinuities for measured ports and reference plane | Live protocol/interoperability, receiver tolerance, unmeasured states, safety; TDR alone is limited | When coupon/channel diagnosis or model correlation justifies it |
| USB4CV/protocol analyzer | Paid/rental/lab; late | USB4 CTS/interoperability procedures for exact generation, DUT setup, approved platform and software | PD isolation/safety, out-of-scope generations/topologies, Thunderbolt branding by itself | Stable integrated prototype after functional/PD gates |
| BERT + compliance lab | Paid/rental/lab; final electrical gate | Named USB4 Electrical CTS TX/RX measurements using approved equipment, fixtures, automation and calibration; formal lab report if in scope | Firmware/functional reliability, mechanical fit, PD safety, anything outside selected CTS | Candidate design freeze after functional/channel/PD evidence |

## Practical order of operations

1. **Design correctness:** KiCad ERC/DRC/CLI, ngspice, firmware tests, and mechanical regeneration checks. Record the exact tool versions and configuration.
2. **Model/data correlation:** use openEMS only with identified stack-up/material/connector models; use scikit-rf to analyze actual solver or measurement Touchstone files. Do not promote a model to measured evidence.
3. **Safe powered prototype:** use current limiting, controlled loads, a PD analyzer and oscilloscope to exercise attach, orientation, VCONN, contract, detach, discharge, interrupted switching and the explicit no-cross-host-VBUS condition. Firmware tests do not replace these observations.
4. **Channel diagnosis:** use a calibrated, adequately ported VNA/TDR on PCB-1A or the integrated channel when model correlation, a failure, or stronger channel claims justify the rental. Retain calibration/de-embedding/reference-plane metadata and raw files.
5. **Compliance/interoperability:** after the integrated functional matrix is stable, engage an approved USB4CV/protocol platform and compliance lab. Recheck the current USB-IF test matrix, CTS revision, approved equipment and software immediately before booking; versions and approved equipment change.

## Source and version policy

The machine-readable companion is [`design/validation-tools/inventory.json`](../../design/validation-tools/inventory.json). It records primary source URLs, scope, non-claims and entry criteria for each family. Run [`validate.mjs`](../../design/validation-tools/validate.mjs) to catch incomplete records.

Primary references used for this matrix:

- [KiCad 9 command-line documentation](https://docs.kicad.org/9.0/en/cli/cli.html) (the page identifies the 9.0.9 documentation basis and ERC/DRC CLI reports).
- [ngspice documentation](https://ngspice.sourceforge.io/docs.html) and [manual](https://ngspice.sourceforge.io/docs/ngspice-manual.pdf).
- [openEMS documentation](https://docs.openems.de/) and [project site](https://www.openems.de/) (openEMS 0.0.35 documentation snapshot).
- [scikit-rf Networks](https://scikit-rf.readthedocs.io/en/latest/tutorials/Networks.html) and [Touchstone I/O](https://scikit-rf.readthedocs.io/en/latest/api/io/index.html).
- [USB-IF USB4 compliance](https://www.usb.org/usb4compliance) and [USB-IF compliance tools](https://www.usb.org/compliancetools).
- [LLVM libFuzzer](https://clang.llvm.org/docs/LibFuzzer.html) for the firmware fuzzing option.

The companion inventory intentionally keeps vendor-specific analyzer, oscilloscope, VNA and lab claims subordinate to the current USB-IF procedure and the exact equipment/setup record. A rental listing or headline bandwidth number is not evidence of suitability.

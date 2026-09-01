# PCB-1A topology explorer visual QA

Date: 2026-09-01

Artifact under test: `components/site-topology-explorer.tsx`, integrated at
`/#pcb1a` by `app/field-guide.tsx`.

Evidence state: **MODELED**. This record covers the website interaction and
responsive layout only. It does not change PCB-1A from `PROPOSED`, authorize an
order, or prove a fabricated or measured RF channel.

## Interactive checks

- At the normal desktop viewport, the explorer rendered the contract-derived
  `PROPOSED` and `NO ORDER` badges, four lane controls and two host controls.
- Selecting lane `D3` and `Host B` produced path
  `D3_HOST_B_TO_COMMON`, input endpoints `D3_B_P / D3_B_N`, and common
  endpoints `D3_C_P / D3_C_N`.
- The inspector retained the contract's 4 measured + 8 inactive + 12 remaining
  port partition and showed the opposite host as inactive.
- The coupon exclusions and the separate null-backed Pico frontend boundary
  remained visible. No USB-C, CC, PD, VBUS, VCONN, router, MCU, product-power,
  compliance, fabricator-acceptance or measured-channel claim was introduced.

## Responsive check and correction

The first 390 x 844 browser run found horizontal overflow: signal endpoint
labels imposed their intrinsic width on the single-column RF diagram. The
component shell and nested grid children now permit shrinking, and signal/code
labels may wrap at safe boundaries.

The corrected 390 x 844 run measured:

- browser inner width: `390 px`;
- document scroll width: `390 px`;
- explorer client width: `320 px`;
- explorer scroll width: `320 px`.

The corrected lane controls, host controls and vertically stacked RF nodes were
visible without horizontal scrolling. The temporary viewport override was
reset after the check.

Independent review then found that the first verifier could miss a broken
component path lookup and removal of the responsive shrink rules. The corrected
implementation centralizes path selection in
`lib/site-topology-model.mjs`. `verify:site-topology` executes all eight lane x
host mappings and all 16 applicable selected-path/state campaigns, rejects
broken path/state mutations, and locks the CSS invariants that closed the 390 px
overflow. The UI wording now limits 4 + 8 + 12 to applicable selected campaign
states; it no longer implies that the two pathless safe states have a selected
four-port measurement.

## Automated checks

`npm run check` passed after the responsive correction. This includes
formatting, lint, TypeScript, the PCB-1A contract and adversarial topology
tests, `verify:site-topology`, evidence/link checks, dependency audit, SBOM
verification and a production site build.

## No-PCB clarity follow-up

Repeated owner questions showed that the section name could still be mistaken
for an existing routed board. The explorer now presents a prominent warning:
“No PCB layout exists yet,” followed by an explicit list of absent KiCad
schematic, traces, Gerbers, assembled board and order package. A local browser
DOM check confirmed both the headline and details render at `/#pcb1a`.
`verify:site-topology` locks this boundary so later copy changes cannot silently
restore the ambiguity.

# Owner-ready access and request packet — issue #19

Status: draft only, prepared 2026-09-01. **Do not submit this packet without the owner.** It intentionally contains no vendor contact, account, company, legal-agreement, confidential-document or firmware data.

## Use boundary

This packet asks vendors to determine whether a reference-backed prototype route exists. It does not claim Thunderbolt certification, USB4/TB4 electrical compliance, broad compatibility, production readiness, or permission to use the Thunderbolt trademark. The requested device is a desk-specific functional prototype subject to the vendor’s accepted reference route and later validation.

Public access routes referenced here:

- Intel: [Thunderbolt Developer Portal](https://www.thunderbolttechnology.net/developer-application) and [RDC/Developer Zone account guidance](https://www.intel.com/content/www/us/en/support/articles/000058073/programs/resource-and-documentation-center.html).
- Infineon: [VD-USB-THUNDERBOLT-REF registration/contact page](https://www.infineon.com/evaluation-board/VD-USB-THUNDERBOLT-REF) and [CYPD5235-96BZXI product page](https://www.infineon.com/part/CYPD5235-96BZXI).

Links were checked as public pages on 2026-09-01. The owner must recheck availability and applicable terms at submission.

## 1. Intel developer application — copy-ready project description

> We are evaluating whether a reference-backed, externally powered Thunderbolt 4 accessory prototype is feasible for one desk. The intended functional arrangement is two computer-facing USB-C ports, with only one selected at a time, and one downstream USB-C port connected to an existing Thunderbolt dock. The device would use a physical selector and an always-on low-speed controller; it would not require host software. The two host VBUS and CC domains must remain electrically separate, and the downstream CC/PD/VBUS/VCONN domain must follow the accepted reference design.
>
> This is an engineering feasibility request, not a certification or branding claim. We will not freeze a schematic, buy controller parts, distribute vendor firmware/collateral, or make compatibility/compliance claims until Intel confirms a permitted controller/reference route, legal terms, and the necessary programming/recovery path.

### Intel application/project fields — owner supplies only

| Portal field or decision | Owner input required | Do not invent |
| --- | --- | --- |
| Legal company name, address, web domain and company type | Current legal business details | No placeholder should be submitted as fact. |
| Applicant name, role, corporate email and phone | Owner-authorized contact | Do not use a personal address if the portal/legal route rejects it. |
| Product name, market, anticipated quantity, schedule, sales intent | Owner’s actual plan | State prototype-only if that is the real status; do not promise volume or launch dates. |
| Existing legal agreements, Intel Partner Alliance/RDC status and account representative | Owner’s actual relationship | Do not assert a CNDA, partner status or support entitlement. |
| Agreement acceptance, confidentiality elections and data-processing consents | Owner’s decision | Read and accept only after owner review. |

### Intel questions — paste into proposal/support request

> Please identify the current supported controller and reference-design route for this bounded externally powered accessory, explicitly comparing **JHL8440 (Goshen Ridge)** and **JHL9440 (Barlow Ridge)**. Our required functional envelope is two independently managed computer-facing USB-C ports with break-before-make selection (only one attached at a time) and one dock-facing downstream USB-C port. We are not asking to infer this topology from a public “quad-port” description.
>
> For the controller Intel approves, please answer the following in writing:
>
> 1. Is this selectable two-upstream/one-downstream arrangement an approved reference-supported topology? If not, which topology or development path should be used instead?
> 2. What exact controller OPN, stepping, carrier and authorized prototype-quantity allocation/channel are available for a new prototype? Are JHL8440 or JHL9440 supported for new design-in?
> 3. Which reference-design revision and controlled collateral apply: full schematic, BOM, PCB/layout constraints, stack-up/channel requirements, clocks, SPI/NVM, reset/straps, approved mux and Type-C/PD/power-protection companions?
> 4. What exact Thunderbolt firmware/NVM artifacts, tools, host requirements and procedures are required for first programming, version readback, recovery after a failed update, rollback, and production programming? Please identify any signed, merged or restricted artifacts and their compatibility constraints.
> 5. Which controller/firmware/PD interfaces and timing/order constraints are mandatory for attach, detach, orientation, mode entry, VBUS/VCONN control and router reset? Which responsibility must remain under the Type-C/PD reference design?
> 6. What Intel review, interoperability, certification and branding steps would apply later if the prototype progresses? We will make no such claim before completing the applicable process.
> 7. For every requested artifact, what is its confidentiality classification, retention rule, sharing restriction and permitted use? May any source, binary, schematic excerpt, BOM entry, footprint/land data, model or derived documentation be published in an open-source repository? Please provide written scope rather than an assumed blanket permission.

### Intel request acceptance criteria

Do not record Intel access as resolved until the owner receives a written response that identifies: the approved controller/topology; exact controlled-document revision(s); prototype sourcing route; firmware/NVM and programming/recovery route; and redistribution restrictions. Record public metadata only in this repository unless the written terms say otherwise.

## 2. Infineon registration/contact request — send only after Intel route is known

Use the VD-USB-THUNDERBOLT-REF registration/contact route only after Intel identifies the supported controller/reference path. Do not represent the public CCG5 diagrams as an approved two-host KVM design.

> We are evaluating a reference-backed, externally powered Thunderbolt accessory prototype. Intel’s written guidance identifies the applicable controller/reference path as: **[OWNER: paste Intel-approved controller, reference revision, and permitted topology only]**.
>
> The device needs independent Type-C/PD/power domains for two computer-facing ports selected one at a time and one dock-facing downstream port. We need the Infineon collateral that is explicitly matched to Intel’s approved route; we are not requesting a generic or inferred CCG5 combination.
>
> Please identify the supported Infineon controller OPN(s), current reference-design revision and the available collateral for that exact route. Please also state the license/redistribution terms and whether the material is restricted. We will retain restricted material outside the public repository and will not distribute it without written permission.

### Infineon questions

> 1. Which current CCG5 (or other) OPN(s) and role assignments are supported for the Intel-approved reference route, including the two computer-facing domains and dock-facing domain? Please distinguish CYPD5235 and CYPD5236 roles; do not rely on the public diagrams alone.
> 2. What exact reference-design revision, schematic, BOM, PCB files, configuration, firmware binary/source availability and tool version apply to that route?
> 3. What is the supported first-programming process and what are the required debug/programming hardware, interfaces, image formats, fuse/protection settings, configuration flow, version-readback, recovery and rollback procedures?
> 4. Is any Thunderbolt Device Configuration utility, merged NVM/PD image, or firmware released by Intel or another party? Who is authorized to provide it, and what are the usage and redistribution restrictions?
> 5. What are the approved Type-C/PD and power-protection requirements for attach/detach, VCONN, VBUS source/sink/reverse-current protection, discharge, wrong-role behavior and router coordination?
> 6. Which exact OPN/package/carrier is available through Infineon or a named authorized distributor in prototype quantity? Is the part blank or preprogrammed, and what traceability/programming-state evidence is supplied?
> 7. For each requested artifact, may it be stored, hashed, reviewed, derived from, or published in a public open-source repository? State confidentiality, retention and sharing restrictions explicitly.

### Infineon request acceptance criteria

Do not record the PD route as resolved until the received material explicitly matches Intel’s approved controller/topology and provides legally usable programming/recovery plus power-domain guidance. A generic CCG5 SDK/tool, a datasheet diagram, or bare-IC purchase path does not close this gate.

## 3. Requested-artifact metadata checklist

For every received artifact, create a local restricted-collateral register entry with the following fields. Store only fields permitted by the applicable terms in this public repository.

| Field | Required value |
| --- | --- |
| Vendor and artifact title | Exact title as supplied |
| Revision/date and source channel | Exact revision/date; vendor portal, PM or authorized distributor |
| Controller/OPN/stepping and reference route | Exact applicability stated by vendor |
| Access classification | Public, account-gated, confidential/NDA, or unknown pending clarification |
| License/use scope | Prototype, production, evaluation, modification and derivative-work rights |
| Redistribution rule | Public repository allowed/not allowed/conditional; quote the clause identifier if permitted |
| Retention and sharing limits | Who may access, where it may be stored, expiration/destruction rule |
| Integrity record | Vendor-supplied checksum/signature, or local hash only if terms permit |
| Firmware/NVM programming record | Tool/version, programmer/interface, target OPN/stepping, image identity, readback/recovery/rollback reference |
| Reference-design coverage | Topology, PD roles, power/protection, mux, NVM, clocks, layout/channel constraints |
| Open questions and owner | Unresolved item, vendor owner/contact channel, next permitted action |

## 4. Restricted-collateral handling plan

1. Treat all newly received controller/reference/firmware material as restricted until the vendor explicitly classifies it otherwise.
2. Do not upload restricted files, excerpts, screenshots, binaries, NVM images, board files, footprints, raw support correspondence, portal exports, credentials or hashes to this public repository.
3. Maintain a minimal public record only: artifact title/revision, access classification, owner of entitlement, permitted high-level claim and a pointer-free status such as `BLOCKED`/`REVIEWED`.
4. Keep restricted collateral only in the owner-approved access-controlled location required by the relevant agreement. Do not share it with agents, contractors or reviewers unless the agreement and owner authorize that access.
5. Before deriving any schematic, footprint, BOM, firmware interface, configuration, model or documentation, obtain written confirmation that the intended derivation and review/storage path is allowed.
6. Before publishing project sources, run a redistribution review against the artifact register. Remove/withhold any content whose permission is unclear; do not rely on “obtained from a portal” as permission.
7. If terms conflict with the intended open-source release, stop and ask the owner whether to redesign around public collateral, retain a closed hardware layer, or end the route. Do not resolve the conflict by copying restricted material.

## 5. Owner execution checklist

- [ ] Decide whether to use a legal business identity and corporate contact for the Intel application.
- [ ] Supply only truthful company, product, quantity, timeline and sales-intent details.
- [ ] Review Intel’s portal terms, privacy notices, developer/license documents and any CNDA before accepting them.
- [ ] Submit the Intel application and preserve the non-confidential submission date/identifier outside this public repository if required.
- [ ] Obtain Intel’s written answer naming the approved controller/topology and controlled collateral route.
- [ ] Review the response for confidentiality and redistribution conditions before sharing it with any collaborator.
- [ ] Send the Infineon request only with the Intel-approved route inserted; register/log in only under owner-approved terms.
- [ ] Obtain the Infineon written match, programming/recovery path, sourcing/traceability route and collateral classifications.
- [ ] Put restricted collateral into an owner-approved controlled location; populate only permitted metadata in the project record.
- [ ] Arrange independent review of accepted non-confidential conclusions before declaring issue #19 closed.

## Explicit non-actions for this packet

This draft does **not** submit a portal form, contact Intel or Infineon, create accounts, accept legal terms, sign an NDA, request or download controlled collateral, obtain parts, or select a controller. Those actions require the owner’s authorization and actual details.

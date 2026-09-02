# Scope, site and baseline release review

- Date: 2026-09-01
- Author/integrator: primary project agent
- Independent factual/safety reviewer: `ctrl1a_release_review`
- Independent website reviewer: `ctrl1a_layout_finish`
- Release scope: corrected integrated-product priority, wider project site/header, transparent-mux teaching boundary and pre-KVM topology capture
- Reviewed content tree: `c29fd30ffe85c0ba697d33e89ffe08a8c367b7a1`
- Status: `REVIEWED` — no remaining P0–P3 findings
- Final-record delta: this status/hash update is review metadata only; it does not alter the reviewed product, safety, site or evidence content

## Findings and dispositions

| Severity | Finding | Disposition |
|---|---|---|
| P2 | The baseline was described as raw while the first retained file normalized several repeated port records, and older site/plan text still said no capture was retained. | Corrected by taking a new read-only capture, redacting only UID/Domain UUID values, preserving the literal remaining command structure, and synchronizing status, validation plan and site language. The full baseline remains `BLOCKED` pending exact host/cable and behavior context. |
| P2 | The public header badge said `Prototype A` while the project remains in pre-PCB design review with the integrated gate closed. | Changed to `Design gate closed`. |
| P2 | One architecture bullet implied three downstream ports, expanding the accepted three-receptacle product boundary. | Corrected to one downstream dock-facing port and three total receptacles. |
| P2 | An older mobile rule hid the redesigned primary navigation below 800 px. | Later rule now explicitly restores the scrollable flex navigation below 1120 px. Browser check at 390 × 844 found all six links visible. |
| P2 | Sticky two-row header could obscure anchor targets at tablet widths. | Added explicit 94 px desktop and 132 px responsive scroll margins for every public anchor. Browser check at 390 × 844 placed `#pcb1a` at 132 px after clicking `Hardware`. |
| P2 | Two older readiness/evidence matrix rows still requested a topology recapture after the new literal sanitized capture was retained. | Synchronized both matrices: the topology capture exists, while exact host/cable and full desk-behavior context remain incomplete. |
| P2 | Several baseline summaries listed cable/behavior gaps but omitted the missing exact host model required by the validation record. | Added the exact-host-model gap consistently to status, validation plan, website and release review. |
| P2 | Public and validation matrices listed switching during an NVMe write without separating destructive fault injection from the accepted stop/eject operating condition. | Canonical requirements now require stop/eject for normal use; interrupted-write testing is labeled destructive, isolated to disposable media/data and followed by recovery/integrity evidence. |
| P2 | The project plan still described switching during general traffic, and the signal/power state machine allowed a warning in place of the accepted stop/eject workflow. | Normal concurrent-traffic validation now excludes switching, normal switching waits for explicit stop/eject acknowledgement, and active-write switching is confined to a separately controlled destructive test using disposable media/data. The MCU is not claimed to detect application-level quiescence. |
| P2 | Status and control-prototype docs reopened the accepted 60 W target and owner decision. | Reframed both as closed product choices whose reference-backed implementation, supply/compatibility proof and validation remain open. |
| P2 | Canonical product requirements and readiness prompts still treated accepted startup, failover, charging and downstream choices as open options. | Synchronized them with the owner-accepted machine-readable response: Host A preference, no automatic failover, up to 60 W selected-host charging, named OWC dock first, isolated hosts on power loss and the remaining measurement gates. |
| P2 | One residual requirements sentence asked the design to re-answer the already accepted named-dock and no-pass-through choices. | Reframed the blocker as reference-backed implementation, isolation/discharge behavior and measurable compatibility limits for those accepted choices. |

## Visual and automated evidence

- Desktop preview visually inspected at the normal in-app browser viewport.
- Responsive preview inspected at 390 × 844.
- Primary navigation remained keyboard/semantic links in a named navigation region.
- `npm run check` passed after all listed fixes against the staged release content.

## Claim boundary

The retained 40 Gb/s value proves only the observed current Mac-to-OWC-dock topology at capture time. It does not prove cable margin, electrical compliance, switching behavior or a KVM. The product remains the complete externally powered two-host/one-dock integrated TB4 KVM; the transparent mux remains teaching/PD-free RF-coupon material only.

# V1 owner decision packet

Status: `OWNER_ACCEPTED` on 2026-09-01 — the exact signed-off response is
[`response.accepted.json`](../../design/product-decisions/response.accepted.json),
with owner evidence recorded on
[issue #3](https://github.com/0x63616c/tb4-kvm/issues/3#issuecomment-5497738070).
This acceptance fixes v1 product behaviour; it does not approve an electrical
design, alter the safety model, accept vendor terms, authorize a purchase or
declare hardware validated.

## How to use this packet

Choose the behaviour you want at the desk. The recommendations below are
conservative defaults for planning; they are not promises that the current
controller route can deliver them. The reference design, power review and
validation matrix must still prove every selected behaviour.

Use the interactive **Decide v1** section on the project site to create a
copyable response. Its answers stay only in that browser until you copy them.
The exact eight-option catalog is
[`design/product-decisions/catalog.json`](../../design/product-decisions/catalog.json).
Machine-readable responses use the fail-closed
[`response.schema.json`](../../design/product-decisions/response.schema.json);
the site can only export a local `DRAFT`, never an owner acceptance.
Choosing any `other` option, or the lower charging target, requires a note;
the local export controls stay disabled until one is provided. The canonical
owner-acceptance acknowledgement is defined in the response schema and is only
valid when an owner records it with their identity, date and evidence reference.

The accepted response deliberately uses `other` for start-up because its exact
rule is more precise than either catalog shortcut: prefer `HOST A`; if A is
absent and B is the sole attached host, select `HOST B`; if neither is attached,
remain safely disconnected.

## Decisions

### 1. Start-up selection

When both laptops are attached when the KVM starts, should it restore the last
safe selection, or always choose one labelled host?

**Conservative default:** restore the last safe selection; if no safe history
exists, choose `HOST A`. This avoids changing desks unexpectedly after a power
event while still giving first use a documented outcome.

**Engineering boundary:** this only happens after supported Type-C/PD
discovery. It does not mean the KVM may energise both hosts or infer presence
from an ordinary GPIO pin.

### 2. Charging promise

What charging promise should v1 make to the selected host?

**Conservative default:** up to 60 W to the selected host; no promised charge
or dock access for the unselected host. It gives the external supply and
thermal design a bounded target and preserves host isolation.

**Engineering boundary:** wattage, downstream-dock power ownership and
reverse-current protection remain blocked pending the accepted reference
design and power review.

### 3. Active-host removal

If the selected host disconnects, should the KVM automatically move the dock
to the other available host?

**Conservative default:** do not automatically fail over in v1. Indicate the
loss and wait for a button press. This avoids a surprise desktop change while
the project still lacks a reference-supported detached-host discovery policy.

**Engineering boundary:** an automatic option can be reconsidered only after
the supported detection, guard sequence and fault behaviour are proven.

### 4. Downstream compatibility promise

Should v1 promise the existing OWC Thunderbolt Dock 96W only, or claim support
for arbitrary docks?

**Conservative default:** support the named OWC dock first. It keeps the
validation matrix finite and prevents a generic compatibility claim before
the downstream port policy and reference design exist.

**Engineering boundary:** the target dock still needs an exact firmware,
cable, display and functional validation record.

### 5. External-power loss

What should happen if the KVM's external supply is absent or fails?

**Conservative default:** isolate both host paths and show an unavailable or
fault state; do not promise dock-powered pass-through. This ensures that a
loss of supervisor power cannot leave an uncontrolled selection or join host
power rails.

**Engineering boundary:** the exact downstream VBUS, VCONN and discharge
behaviour must come from the accepted reference design.

### 6. Switching experience

What should the v1 validation target record as acceptable switch latency?

**Conservative default:** record the complete switch and its stages, but make
no elapsed-time promise yet. Choose the desk experience you want below so the
team can set a later measurable acceptance criterion.

**Engineering boundary:** exact detach, discharge, attach, mode-entry and
training timing are vendor/reference-design values, not values an owner choice
can override.

**Accepted operating condition:** stop or eject external-storage activity
before switching. V1 does not promise a safe hot switch while writes are in
flight.

### 7. Status surface

What should the always-on display or indicator communicate?

**Conservative default:** selected host, switching/waiting/fault state and
only controller-supported PD/link facts. It is useful without inventing
throughput, compliance, or host-activity telemetry.

**Engineering boundary:** a `READY`, rate or wattage claim needs the named
evidence stated in `docs/CONTROL-STATE-MACHINE.md`.

### 8. Mechanical envelope

What physical-size boundary should define a successful v1 main unit?

**Conservative default:** keep the exposed interface minimal—three TB4
receptacles, onboard control/status and a protected remote-pod connector—but
defer a hard size promise until the released PCB and thermal map are measured.
If a planning maximum is important, the workbench offers a target of no more
than 180 × 120 × 45 mm excluding the external power brick and cables.

**Engineering boundary:** a compact intention is not a dimension. Connector
clearances, cable bend space, insulation, cooling and the reviewed PCB can
require the owner to accept a revised envelope.

## Prototype A conditions

- The KVM may use its own separate external power brick.
- The unselected laptop may use a separate charger; v1 promises no charging on
  its detached KVM port.
- Product acceptance does not waive the reference-design, electrical safety,
  signal-integrity, independent-review, purchasing, fabrication or protected
  bring-up gates.

## Copyable response

The response must state a choice for every decision and may add a short
constraint such as a host label, a desired latency, or a display preference.
Do not use it to accept vendor terms, authorize purchases/fabrication, or
declare the design electrically proven.

```text
TB4 KVM v1 owner decision response

Start-up selection: [restore last safe selection / choose HOST A / other]
Selected-host charging: [up to 60 W / lower target / other]
Active-host removal: [wait for button / auto-failover after validated guard / other]
Compatibility promise: [named OWC Thunderbolt Dock 96W first / broader after validation / other]
External-power loss: [isolate both hosts; no pass-through / other]
Switching target: [record only until measured / target: ______ / other]
Status surface: [selected host + truthful state only / include supported PD/link facts / other]
Mechanical envelope: [defer until PCB and thermal measurements / target at most 180 × 120 × 45 mm excluding power brick and cables / other]

Notes or constraints: ______

I understand these are product choices, not electrical evidence, a vendor-terms acceptance, a purchase authorization, or closure of issue #3.
```

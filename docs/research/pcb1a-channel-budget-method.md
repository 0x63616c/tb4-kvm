# PCB-1A channel-budget method

Status: `PROPOSED` allocation method and data contract. It authorizes neither a
numeric PCB-1A product limit nor a USB4/Thunderbolt compliance claim.

## Boundary and records

PCB-1A is a measurement-only four-pair mux coupon. It has no USB-C,
CC, PD, VBUS, router, or protocol link. It can help correlate a modeled
component/package/PCB channel and localize a prototype failure, but cannot
establish USB4/TB4 compliance or universal compatibility.

The contract comprises:

- [`schema.json`](../../design/channel-budget/schema.json), a Draft 2020-12
  schema;
- [`prototype-a-example.json`](../../design/channel-budget/prototype-a-example.json),
  the intentionally `BLOCKED`, TBD-bearing Prototype A record; and
- [`test-only-closed-fixture.json`](../../design/channel-budget/test-only-closed-fixture.json),
  a synthetic evaluator fixture whose values and limits are explicitly not
  product requirements; and
- [`validate.mjs`](../../design/channel-budget/validate.mjs), executed by
  `npm run verify:channel-budget`.

The accepted prototype-first decision still permits Prototype A to proceed
without paid PCB-1A measurement after its separate safety, sourcing, reference,
manufacturing, review, and owner-approval gates close. Missing paid measurement
remains an evidence gap and may be selected later when diagnostic value warrants
it.

## Topology, planes, and scenarios

Every record identifies a board revision and serial, a strictly ordered sweep,
and a validated band within that sweep. At least one declared sample must be in
that band. The evaluator reduces only those in-band samples, and the declared
worst frequency must be one of them. The calibrated raw reference plane is kept
distinct from a de-embedded PCB package-land plane; no silicon-die plane is
inferred.

The single-ended port map is machine-readable and unique. Each differential
pair has one P and one N port. The mixed-mode order lists every port exactly
once in P,N order and fixes the 50 ohm single-ended, 100 ohm differential, and
25 ohm common-mode references. Conversion is calibrated single-ended,
de-embedded, renormalized, then converted to mixed mode.

Each scenario names its lane, direction, DUT state, board conditions, fixture
structure, and a per-port termination network at a named plane. Ports carry
explicit `HOST_A`, `HOST_B`, or `COMMON` roles. The selected path and
aggressor are bound to the scenario lane and selected host, and the inactive
host pair for that same lane must have the declared termination in the same
network and plane. Every mapped network port must be on its declared plane. An
applicable scenario must use the DUT fixture; a plain thru is only a
process/launch comparator, never the allocation DUT or automatic extraction
network. An excluded scenario must state why it is excluded. A Hi-Z state is
allowed only when a named authoritative datasheet/model record supports it.

Lane skew is not a single-lane measurement. It uses one explicit coupled set of
four distinct scenarios covering D0 through D3, with direction, mux state,
inactive termination, power, temperature, fixture structure, termination
network, and group-delay path roles held constant. The verifier rejects an
incomplete, duplicated, reversed, or thermally different lane set.

## Observable calculations

The contract has exact observable domains rather than free-form dB arithmetic:

| Domain | Required scope/reducer | Bound evaluated by verifier |
| --- | --- | --- |
| insertion loss | per applicable scenario / maximum | summed network result plus only explicitly labeled allocation penalties, uncertainty, and design margin |
| return loss | per applicable scenario / minimum | network result minus uncertainty and design margin |
| coupling (crosstalk or mode conversion) | per applicable scenario / maximum | signed `20 log10(abs(Sxy))` level plus uncertainty and design margin |
| group delay | per applicable scenario / maximum | absolute error from its declared target plus uncertainty and design margin |
| lane skew | coupled four-lane set / maximum | maximum group delay minus minimum group delay, plus uncertainty and design margin |

Coupling is deliberately signed (normally negative dB) and is therefore not
rejected merely for being negative. Return-loss dB values are never summed. Nor
does the verifier treat arbitrary dB terms as physical cascades: only insertion
loss can contain separately labeled allocation penalties; every other
observable has exactly one network result. All term samples must match the
declared, strictly increasing frequency array. The evaluator calculates the
specified maximum or minimum across the validated band and verifies the
declared worst-frequency result as well as the remaining margin for both `LE`
and `GE` limits.

## Uncertainty and evidence

Every contributor declares a unit, distribution, sensitivity, and whether it
is shared or independent. The supported combination rules are
`INDEPENDENT_RSS`, `CONSERVATIVE_SUM`, and `COVARIANCE`. Covariance uses a
validated symmetric correlation matrix with a unit diagonal; contributors
declared independent cannot carry nonzero covariance. The verifier recomputes
`u_c` and checks the stored expanded uncertainty `U = k * u_c`.

For a closed allocation every applicable scenario times every required
per-scenario observable, and every required four-lane observable, must have
terms and exactly one cross-referenced limit. Each included term must have
accepted, nonempty evidence; `D_ASSUMPTION` and `TBD` evidence cannot close an
allocation. Terms, scenarios, ports, mixed-mode order, limits, and evidence IDs
are all unique. A missing term, hidden additional term, bad frequency, negative
remaining margin, or unaccepted evidence blocks closure.

`CLOSED_FOR_PROTOTYPE_ALLOCATION` means only that this allocation contract was
closed. It does not authorize compliance, fabrication, ordering, paid
measurement, or a product-performance claim. A non-test closure may use neither
test-only/synthetic evidence or planes nor synthetic limit sources, even if
they are relabeled; its allocation paths must be at PCB package-land planes.
The only closed JSON in this repository is marked `testOnly` and uses only
`SYNTHETIC_TEST_ONLY` limits.

## Measurement relationship

When PCB-1A is measured, retain calibrated raw single-ended Touchstone, 2x-thru,
plain-thru comparator, extracted fixture, de-embedded and mapped mixed-mode
data, plus calibration/de-embedding, board, port/polarity, termination, state,
temperature, and file-hash evidence. The measurement-validity gate in
[`PCB-1A-MEASUREMENT-METHOD.md`](../PCB-1A-MEASUREMENT-METHOD.md) remains
separate from allocation closure and product acceptance.

## Primary sources

- [IEEE Std 370-2020](https://standards.ieee.org/ieee/370/6165/) — fixture
  characterization and de-embedding practice.
- [Rohde & Schwarz fixture characterization](https://www.rohde-schwarz.com/us/applications/accurate-test-fixture-characterization-and-de-embedding_56280-1271617.html)
  — 2x-thru workflow.
- [Keysight de-embedding application note](https://www.keysight.com/zz/en/assets/7018-06806/application-notes/5980-2784.pdf)
  — reference-plane and fixture-correction practice.
- [Touchstone 2.1](https://ibis.org/touchstone_ver2.1/touchstone_ver2_1.pdf)
  — explicit port ordering.
- [USB-IF USB4 specification library](https://www.usb.org/document-library/usb4r-specification)
  — CTS context at its own defined planes; its masks are not PCB-1A limits.

# Collateral-policy review — 2026-09-01

## Scope

Independent review of the issue #22 early open-source collateral policy, machine-readable schema, example inventory and fail-closed validator.

## Findings and dispositions

The first review found that `UNKNOWN` could retain a supposedly permitted hash, `OPEN_REDISTRIBUTABLE` could omit the governing terms URL, author-only review could appear accepted, and classification/terms combinations were insufficiently cross-bound.

The second review found that `UNKNOWN` and `PROHIBITED` could still retain hashes by asserting permission, and an accepted owner-adoption record could omit its owner/date/evidence.

All findings were implemented. The final reviewer independently verified:

- `UNKNOWN` and `PROHIBITED` reject any retained hash unconditionally;
- gated/NDA/private hash metadata requires the policy's explicit permission evidence;
- `OPEN_REDISTRIBUTABLE` requires exact governing public-license or written-permission evidence and compatible redistribution state;
- contradictory classification/terms/redistribution combinations reject;
- author-only or missing-reviewer `REVIEWED` records reject;
- `ownerAdoption` is required;
- `PENDING` cannot contain adoption identity/evidence;
- `ACCEPTED` requires a nonblank owner, ISO date, evidence and `ADOPTED` policy state.

The base inventory validates and six supplied adversarial mutants plus additional adoption cross-field attacks reject. No P0–P3 finding remains.

## Result

The policy artifacts are technically review-complete. GitHub issue #22 remains open because the owner has not explicitly adopted the policy. The example correctly stays `PROPOSED`, `UNREVIEWED` and owner adoption `PENDING`.

This review does not provide legal advice or accept any vendor terms. It confirms only that the repository's classification and release controls fail closed according to the written project policy.

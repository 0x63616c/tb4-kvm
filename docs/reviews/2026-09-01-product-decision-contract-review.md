# Product-decision contract review — 2026-09-01

## Scope

Independent review of the issue-#3 single-source product-decision contract and
its integration after commit `3c47e23`:

- `design/product-decisions/catalog.json`;
- `design/product-decisions/response.schema.json`;
- `design/product-decisions/response.example.json`;
- `design/product-decisions/validate.mjs` and `test.mjs`;
- `components/owner-decision-workbench.tsx`;
- `docs/product/v1-owner-decisions.md`; and
- the package gate, project status and evidence ledger.

This is a product/release-contract review. It does not accept an electrical
architecture, schematic, signal-integrity model, power design or manufacturing
release, so a lower-cost independent reviewer was appropriate.

## Findings and dispositions

The first review found one P1: the product-decision validator and adversarial
tests passed independently but were absent from the mandatory repository gate.
The fix adds `verify:product-decisions` and invokes it from `npm run check`.

Integration review also hardened the contract before signoff:

- every `other` option and the lower charging target require nonblank notes;
- the UI labels those choices and disables text/JSON export until notes exist;
- the exact owner-acceptance acknowledgement is a schema constant used by the
  validator and displayed by the UI;
- text and JSON copy actions maintain separate status;
- malformed/null inputs fail closed; and
- the suite includes 15 rejected mutants plus a generated, temporary synthetic
  `OWNER_ACCEPTED` positive path that is explicitly not a real acceptance.

## Browser verification

A fresh local browser session rendered eight decision cards with
`aria-busy=false` and no console errors. Selecting a notes-required option made
both copy actions unavailable and displayed the explanation requirement. After
entering notes, both actions became available. Copied JSON reported
`responseStatus: DRAFT` and all four owner-acceptance fields were null. Copying
JSON changed only its own button status; the text-copy action remained labeled
`Copy response`. Reset restored defaults.

Blob download behavior retains the earlier code-reviewed limitation: the
browser harness does not emit a reliable blob-download event. Copy is the
browser-proven export path.

## Result

After the P1 disposition, exact-tree rereview found no remaining P0–P3 issue.
The full repository gate passes and now includes the decision validator/tests.
The contract is `REVIEWED`, but issue #3 remains open: defaults and DRAFT export
are not owner acceptance and do not unblock issue #17.

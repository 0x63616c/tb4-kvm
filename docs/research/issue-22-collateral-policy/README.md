# Issue #22 — early open-source collateral policy

Status: `PROPOSED` (issue-owned policy; no vendor terms accepted and no restricted artifact copied)

This policy answers the question in [issue #22](https://github.com/0x63616c/tb4-kvm/issues/22): how can the project record useful public evidence and reproduce project-authored outputs without allowing restricted vendor collateral into Git history?

It is an engineering repository control, not legal advice. A URL, a download that was visible without signing in, or a file found in a vendor portal does not grant a license to copy, modify, mirror, or redistribute it. The applicable publisher terms, contract, NDA, account agreement, and written permission control. If those terms are unavailable or ambiguous, classify the item as `UNKNOWN` and keep the artifact out of the repository.

## Default boundary

The repository may contain project-authored source, generated outputs, links, and a minimal inventory of external evidence. It must not contain vendor-confidential collateral, credentials, tokens, private correspondence, account exports, or personally identifying machine data. This includes files obtained through a developer portal or under registration, even when they can be downloaded by an authorized user.

An inventory record is not an authorization record. It records what was observed, where it came from, its access state, and what may safely be published. The absence of an inventory record is not permission to publish.

## Classification

Use exactly one classification per artifact (or per inseparable artifact bundle). When a bundle contains mixed terms, split the records or use the most restrictive classification.

| Classification | Meaning and repository treatment |
| --- | --- |
| `PUBLIC_LINK_ONLY` | A public page/document may be linked as evidence, but redistribution, local mirroring, or derivative publication has not been established. Keep only the URL and safe metadata; no downloaded copy. |
| `OPEN_REDISTRIBUTABLE` | A governing public license or written permission explicitly permits the intended repository redistribution. Record the exact license/terms and retain required notices. Copy only the permitted artifact and only within its scope. |
| `REGISTRATION_GATED` | Access requires account registration, product entitlement, click-through terms, or an invitation. Keep the artifact out of Git; record safe metadata and the official access route. Do not accept terms on behalf of the owner. |
| `NDA_CONFIDENTIAL` | Access or use is restricted by NDA, CNDA, confidential designation, contract, or equivalent obligation. Never commit, quote, extract, or mirror the content. Record title/revision and restriction metadata only when safe. |
| `OWNER_PRIVATE_METADATA_ONLY` | The owner supplied or privately obtained the artifact, or it contains private/account/device information. Store no artifact in this repository; record only the minimum owner-approved metadata needed to track an external copy. |
| `PROHIBITED` | Publication is forbidden by terms, policy, safety, privacy, or an explicit owner/vendor restriction. Do not store, derive, summarize sensitive content, or link to an unauthorized mirror. Escalate and remove any accidental copy. |
| `UNKNOWN` | The source, terms, permission, provenance, or restriction is unresolved. Default to no artifact, no excerpt, no hash, and no redistribution until reviewed. |

### Common vendor collateral

Vendor drawings, CAD/STEP models, ECAD footprints, S-parameters, IBIS/IBIS-AMI models, reference schematics/BOMs, firmware/NVM images, programming or recovery tools, PCNs, and portal screenshots are external artifacts. Classify each separately; do not assume that a public datasheet makes an accompanying model, drawing, binary, screenshot, or portal asset public. A screenshot can expose account or confidential information and is not a substitute for a source document.

The issue #5 and #19 research records deliberately preserve links and safe findings while identifying gated models, controller reference collateral, firmware/NVM, and programming material as blocked or gated. Follow that precedent:

- [Issue #5 parts evidence](../issue-5-parts/README.md) keeps vendor model/source gaps visible without storing models.
- [Issue #19 controller route](../issue-19-controller-route/README.md) records Intel/Infineon access states without copying reference designs, binaries, correspondence, or credentials.
- [Licensing plan](../../../LICENSE.md) states the intended project licenses and that third-party terms remain controlling.
- [Review and release policy](../../REVIEW-AND-RELEASE-POLICY.md) requires independent review and immutable release evidence.

## Inventory fields and hash rule

Use the machine-readable template at [`design/collateral-policy/inventory.example.json`](../../../design/collateral-policy/inventory.example.json), checked by [`design/collateral-policy/validate.mjs`](../../../design/collateral-policy/validate.mjs) and adversarial mutants in [`design/collateral-policy/test.mjs`](../../../design/collateral-policy/test.mjs). Each record must include:

- stable `id`, `title`, `artifactKind`, `classification`, `sourceUrl` (or an explicitly documented owner-private source), `accessedDate`, `revision`, and `custodian`;
- `terms`: status, terms/license URL when available, and a short evidence note. `UNKNOWN` is required where the terms cannot be established;
- `redistribution`: whether repository redistribution is permitted, forbidden, or unknown, plus the evidence basis;
- a safe `repository` disposition stating whether an artifact path is allowed and where metadata is recorded; and
- author, independent reviewer/attestation, review status/evidence, and review date. `REVIEWED` requires a reviewer distinct from the author; the example intentionally remains `UNREVIEWED`.

Hashes are metadata, not a license. Record a cryptographic hash only when the governing terms or written permission allow it, and record an explicit permission basis plus its governing evidence URL. If permission is absent, unclear, or prohibited, omit the hash and explain why. In particular, `UNKNOWN` and `PROHIBITED` records, and gated/NDA/private records without explicit hash permission, must never retain a hash. Never use a hash to identify or reconstruct a restricted file, and never commit a restricted artifact merely because its hash is recorded. Hashing a private or sensitive artifact may itself disclose information or create an unwanted durable identifier.

Safe metadata is limited to facts needed for traceability: title, publisher, exact part/document identifier, revision/date, source URL, access date, classification, terms/access state, and an owner-approved hash where permitted. Exclude document contents, screenshots, credentials, tokens, cookies, portal identifiers, personal data, and confidential filenames when those reveal more than necessary.

## Review and release gate

Before merging a new external record or any project output derived from external material, the author must identify the source and classify it. An independent reviewer then checks the exact source/revision, terms/access evidence, classification, hash permission, repository path, notices/attribution, and whether generated output accidentally embeds restricted content. The author cannot be the sole reviewer. Record the finding and disposition under `docs/reviews/` when the change is material.

Release is blocked when any included artifact is `REGISTRATION_GATED`, `NDA_CONFIDENTIAL`, `OWNER_PRIVATE_METADATA_ONLY`, `PROHIBITED`, or `UNKNOWN`; when `OPEN_REDISTRIBUTABLE` lacks explicit license/permission evidence; when a hash lacks permission; or when provenance and generated-output inputs cannot be reproduced. A public link may support research claims but does not close a source, model, firmware, or legal-reproducibility gate. Release manifests must list source and output hashes only under the same permission rule.

This policy does not change the prototype-first decision: a functional prototype may be pursued after its technical gates close, but no prototype schedule justifies copying or publishing restricted collateral.

## Takedown and correction

Anyone who finds a suspected restricted or incorrectly classified item should open an issue without attaching the material or quoting its contents, and notify the repository owner privately if the issue itself could disclose sensitive metadata. The release owner should:

1. stop publication or release of the affected path and preserve only the minimum incident metadata;
2. remove the artifact, derived excerpts, credentials, and sensitive screenshots from the working tree and release outputs using the least-destructive available process;
3. assess Git history, caches, Pages/build outputs, and published release bundles, then rotate credentials or contact the owner/vendor when applicable;
4. correct the inventory classification, provenance, notice, and affected claims; and
5. record the correction/takedown date, scope, reason, reviewer, and verification that public copies are no longer served.

If history removal is necessary, treat it as an owner-approved repository operation with a documented replacement commit and downstream notification; do not rewrite history casually. A correction that changes a technical claim also requires the normal independent review and release gate. Do not contact a vendor, accept terms, or make a legal assertion on the owner's behalf without explicit authorization.

## Current issue result

The policy and template are `PROPOSED`, not a blanket clearance of existing or future collateral. Issue #22 can close positively only after an independent review confirms the policy, validator, and example contain no restricted artifacts and the project records adoption/owner acceptance in the issue. Vendor access, terms acceptance, copying, external takedown requests, and GitHub mutation remain owner-only actions.

# PCB-1A, parts and Pages exact-tree review

- Reviewed staged tree: `25941a7f89aece89ffa43749a661c8b8df01d6fc`
- Review date: 2026-09-01
- Author/implementer: primary Codex agent
- Independent reviewers: `si_exact_review`, `parts_exact_review`, `pages_exact_review`
- Final outcome: no open P0–P3 findings

## Signal-integrity and measurement review

The first review found an impossible lifecycle dependency: the order-ready coupon package depended on measurements that require the coupon to have already been fabricated. It also found non-executable metrology-validity wording, incomplete raw-evidence assertions and verifier gaps.

Disposition:

- split pre-order lab/fabricator/parts/channel-budget gates from post-fabrication fixture qualification and SI measurement;
- kept product/channel limits empty while adding explicitly provisional, lab-acceptance-gated metrology criteria;
- kept measurement-validity and USB4/TB4 compliance claims unauthorized;
- required raw plain-thru and mixed-mode data, mappings, state/environment logs, noise/repeatability captures and manifests;
- protected required observables, validity rules, IEEE 370 residual checks, uncertainty contributors, remates and unresolved criteria in `verify:pcb1a`.

The final reviewer reran the PCB-1A, evidence, link and diff checks on an exported snapshot of the exact staged tree and reported no P0–P3 findings.

## Parts, sourcing and fabricator review

The first review found that the public parts table used the Semtech family name and made Intel channel approval sound like the only remaining gate.

Disposition:

- changed the research OPN to `RClamp01012ZC.F`;
- marked it `Research OPN / DNP`;
- retained lifecycle, model, land-pattern, assembly, sourcing and full-channel gates;
- kept the PCBWay inquiry draft, job-specific and explicitly non-authorizing;
- kept the BOM, coupon and integrated board non-orderable.

The final reviewer confirmed the exact staged tree had no P0–P3 parts, vendor, PCBWay or order-readiness findings.

## GitHub Pages, guide and governance review

The first review found workflow-wide deployment permissions, a back-link escaping the repository site, incomplete local preview instructions, an undiscoverable hub and the wrong Markdown content type in the preview server.

Disposition:

- limited the build job to read-only repository access and granted Pages/OIDC permissions only to deploy;
- corrected the hub back-link and added direct README/application hub links;
- added a path-safe local preview server mounted at `/tb4-kvm/` plus exact build/preview instructions;
- served Markdown as `text/markdown; charset=utf-8`;
- retained revision/SHA-256 manifest binding and an honest zero-hardware-artifact state.

The final reviewer verified the exact tree's static build, Pages paths, root/hub/manifest/assets, traversal containment, 30 manifest hashes and preview content types. No P0–P3 findings remained.

## Checks recorded before review

- `npm run check`
- `VITE_GIT_COMMIT=$(git rev-parse HEAD) npm run build:pages`
- `npm run preview:pages` with HTTP probes for the mounted root, CSS, hub and Markdown
- `git diff --cached --check`

The review report itself was added after the target tree was frozen; it does not alter the reviewed design, code or evidence claims.

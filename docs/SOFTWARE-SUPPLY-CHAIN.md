# Software supply-chain policy

The website is public software and must not pass release CI while known high/critical dependency advisories remain unreviewed.

## Continuous gate

- `npm ci` installs the exact lockfile.
- `npm audit --audit-level=high` blocks high and critical advisories.
- `npm run verify:sbom` generates and parses a CycloneDX runtime SBOM from the lockfile.
- GitHub Actions are pinned to immutable commit SHAs and reviewed when updated.
- Unused packages are removed rather than carried as dormant audit surface.

Moderate/low findings still require review before a public release. Any temporary exception must identify the advisory, affected dependency path, reachability analysis, containment, owner, expiry and revalidation trigger in the evidence ledger and a review record. No exception may be implied solely because the build succeeds.

## Release artifacts

Each website/software release must retain:

- CycloneDX SBOM JSON;
- lockfile digest and tool versions;
- `npm audit --json` result;
- source commit and dirty-state flag;
- build manifest and output hashes;
- any accepted exception record and independent security review.

The normal CI check verifies that an SBOM can be generated; immutable release packaging will store the actual generated file and its hash.

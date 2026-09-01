# Release governance

## Current gate

`GATE-GOV-001` remains **BLOCKED** until both of these independently verified conditions are true:

1. GitHub protects `main`, requires the `check` status, requires pull requests, requires at least one approval, dismisses stale approvals, and blocks force-pushes and deletion.
2. A qualified human who is not the author approves the exact protected release revision. Agent review is additional evidence and cannot satisfy this human-approval gate.

Branch-protection configuration is remote state, so a repository document cannot prove it by itself. Capture the GitHub API response and the approving review URL against the exact commit before changing this gate to `VALIDATED`.

## Immutable website evidence

The field guide accepts `VITE_GIT_COMMIT` only when it is a full 40-character lowercase Git object ID. CI supplies `github.sha`. Evidence links use that revision instead of mutable `main`; builds without it show `unreleased-working-tree` and do not make repository paths clickable.

## Release rule

Do not publish an immutable release, fabrication approval package, or claim an independently reviewed baseline while `GATE-GOV-001` is blocked.

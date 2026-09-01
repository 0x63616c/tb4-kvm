# Release governance

## Current delivery policy

The owner selected direct-to-`main` delivery on 2026-09-01 and asked the project not to use pull requests for now. `GATE-GOV-001` therefore records **REVIEWED** repository discipline rather than a pull-request approval requirement.

Before each direct push:

1. run the full local repository gate on the exact staged tree;
2. obtain independent agent review in every affected domain and persist findings/dispositions under `docs/reviews/`;
3. confirm the update is a fast-forward from the current remote `main`; and
4. do not weaken hardware evidence, fabrication approval or safety gates to make delivery easier.

After each push, verify the GitHub Actions run is for the exact new `main` commit. A failed or missing run leaves the software publication unverified even if local checks passed. Remote protection should continue to block force-pushes and branch deletion. Pull-request review can be reinstated later if the owner changes the delivery policy.

This policy does not authorize fabrication. The owner must still approve the exact immutable hardware release package before any order is placed.

## Immutable website evidence

The field guide accepts `VITE_GIT_COMMIT` only when it is a full 40-character lowercase Git object ID. CI supplies `github.sha`. Evidence links use that revision instead of mutable `main`; builds without it show `unreleased-working-tree` and do not make repository paths clickable.

## Release rule

Do not call a website or repository revision verified until its exact-head local checks, independent reviews and post-push GitHub Actions evidence are recorded. Do not call a hardware release order-ready until its separate electrical, SI, DFM and owner-approval gates pass.

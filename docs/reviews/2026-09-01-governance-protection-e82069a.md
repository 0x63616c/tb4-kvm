# GitHub governance evidence for `e82069a`

Date checked: 2026-09-01

Repository: `0x63616c/tb4-kvm`

Protected branch: `main`

Reviewed baseline: `e82069a212d32a4d883f171df9d5528b233fa0d2`

## Pushed baseline and CI

The independently agent-reviewed tree was committed as `e82069a212d32a4d883f171df9d5528b233fa0d2` and pushed to `main`. GitHub Actions run [33514935845](https://github.com/0x63616c/tb4-kvm/actions/runs/33514935845) completed successfully. Its required check-run context is `project`, reported by GitHub Actions application ID `15368`.

## Live branch-protection response

After the CI result completed, the GitHub branch-protection API accepted and returned these settings for `main`:

- strict required status check: `project`, bound to GitHub Actions application ID `15368`;
- pull request required;
- one approving review required;
- stale approvals dismissed;
- last pusher cannot supply the required approval;
- protections enforced for administrators;
- linear history and resolved review conversations required;
- force pushes disabled;
- branch deletion disabled.

This is point-in-time remote evidence. Re-query `GET /repos/0x63616c/tb4-kvm/branches/main/protection` before relying on it for a later release.

## Remaining blocker

At capture time, the GitHub collaborators API listed only `0x63616c`. No distinct qualified human reviewer was available. Agent reviews do not satisfy the human-approval requirement. Therefore `GATE-GOV-001` remains **BLOCKED**, even though technical branch protection is now active.

Do not change the gate to `VALIDATED` until a distinct qualified human approves the exact proposed release revision and the approval URL is retained here or in a successor review record.

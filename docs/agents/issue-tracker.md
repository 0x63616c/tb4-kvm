# Issue tracker: GitHub

Issues and project wayfinding tickets live in [0x63616c/tb4-kvm GitHub Issues](https://github.com/0x63616c/tb4-kvm/issues). Use the `gh` CLI from this repository.

## Conventions

- Create, read, comment, label, assign and close work with `gh issue`.
- Pull requests are **not** a request or delivery surface for now. Agents work toward `main` under the exact-tree review and CI rules in `AGENTS.md`.
- A wayfinding map has label `wayfinder:map`; its child tickets use `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling` or `wayfinder:task`.
- Use GitHub sub-issues for map membership and native issue dependencies for blocking edges. If either API is unavailable, record `Part of #<map>` and `Blocked by: #...` in the child body without hiding the fallback.
- Claim an unblocked ticket before working by assigning it to the active GitHub user. Do not claim blocked or already assigned tickets.
- Resolve a wayfinding ticket with an evidence-linked resolution comment, close it, then add a one-line pointer under the map's `Decisions so far` section.

## Wayfinding operations

- Create the map with `gh issue create --label wayfinder:map`.
- Add a child using GitHub's sub-issues endpoint and the child issue database ID.
- Add a blocking edge using the dependencies endpoint and the blocker's database ID.
- The frontier is the ordered set of open, unassigned child tickets with zero open blockers.
- Refer to issues by linked title in human-facing prose, not by bare number.

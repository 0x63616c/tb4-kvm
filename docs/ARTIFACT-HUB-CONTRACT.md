# Artifact hub and viewer contract

## Purpose

GitHub Pages publishes the interactive field guide and a revision-bound project index at `/tb4-kvm/project/`. The project index is a visual browser, not a new source of truth. Its files are copied from the exact checked-out commit during the Pages build.

The Pages build uses Vinext static export with Vite's `/tb4-kvm/` base. Vinext currently leaves generated font preloads and social-image metadata at development-root URLs, so the assembly script normalizes those exported HTML references to the repository base and canonical `https://0x63616c.github.io/tb4-kvm/` origin before upload.

The generated `/project/index.json` records the full source commit and SHA-256 of every indexed file. The initial hub includes repository Markdown and the evidence ledger. It intentionally contains no PCB or CAD artifacts.

## Manifest entry contract

Every future object in `artifacts` must contain:

- a stable `id`, human `title` and controlled `kind`;
- the full source `revision` plus a displayed `revisionLabel`;
- an allowed repository evidence `evidenceState` and an honest displayed `evidenceLabel`;
- a relative, traversal-free `path`, SHA-256 and media type;
- `viewer.mode` and `viewer.status` that describe what this deployed revision actually supports.

Allowed artifact kinds are `pcb-render`, `gerber`, `step`, `stl` and `3mf`. Allowed evidence states are `PROPOSED`, `MODELED`, `REVIEWED`, `FABRICATED`, `MEASURED`, `VALIDATED` and `BLOCKED`, with their meanings defined in `AGENTS.md`. A viewer label never raises an evidence state.

## Viewer and download behavior

| Kind | Minimum release material | Safe initial behavior | Rich viewer gate |
| --- | --- | --- | --- |
| PCB render | image plus source revision and source-tool identity | image display | image hash matches manifest |
| Gerber | immutable release archive and release manifest | download only | CAM parser tested against representative, non-confidential release data |
| STEP | source CAD, deterministic export and release manifest | download only | geometry viewer verifies format, units and load failure handling |
| STL | source CAD, export and mesh-validation evidence | download only | mesh viewer verifies geometry and units; it must not imply slicer or fit acceptance |
| 3MF | source CAD, deterministic export and slicer-import evidence | download only | viewer/import path is tested with a real geometry-bearing file |

`available` means the deployed page has a tested rendering or download path for a real indexed file. `no-artifact` means the presentation mode is known but no release file exists. `not-implemented` means the project makes no browser-viewer claim. Missing, malformed or hash-mismatched entries must be hidden or displayed as blocked; they must never silently fall back to a success state.

## Publication rules

1. Hardware files come only from immutable revision folders under `hardware/releases/`; the Pages assembly step must not discover arbitrary working exports.
2. Each release remains subject to the repository review/release policy and its own manifest. The website manifest indexes that evidence; it does not replace it.
3. Pages must be built from a full 40-character commit SHA. The workflow injects `github.sha`, and deployment must use the artifact produced by that same job.
4. Links are relative to `/project/` so the same output remains valid at the GitHub repository base path.
5. Adding a file extension does not enable a viewer. Viewer status changes require implementation, fixture-based tests and a real indexed artifact.

## Local verification

Run the Pages build with a real revision:

```sh
VITE_GIT_COMMIT="$(git rev-parse HEAD)" npm run build:pages
```

The publishable directory is `dist/client`. Confirm it contains `index.html`, `.nojekyll`, `project/index.html`, `project/index.json`, `project/docs/` and `project/evidence/`. Inspect `project/index.json` to confirm the source revision, file hashes, zero hardware artifacts until a release exists, and truthful viewer states.

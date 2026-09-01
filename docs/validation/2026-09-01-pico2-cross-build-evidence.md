# Pico 2 exact-head cross-build evidence

Evidence date: 2026-09-01

Repository commit: `00eb784bca677eafc87dbbf7470becce50b5d060`

Workflow run:
[`33549979596`](https://github.com/0x63616c/tb4-kvm/actions/runs/33549979596)

Result: **PASS — compile evidence only**

## Recorded inputs

- Runner image family: Ubuntu 24.04
- Arm compiler: `arm-none-eabi-gcc` 13.2.1 (`15:13.2.rel1-2`)
- Arm C++ Newlib package: `15:13.2.rel1-2+26`
- Pico SDK: `2.3.0`
- Exact SDK commit: `98a542c1a62fb549ffb5d66a3e5892b06276b670`
- Board/platform: Pico 2 / RP2350A / `rp2350-arm-s`
- Compiler selector: `pico_arm_cortex_m33_gcc`
- `PICO_NO_PICOTOOL=ON`

The run fetched the exact SDK commit, initialized its recorded recursive
submodules, and passed the repository's SDK/board identity verifier before
configuration.

## Recorded result

The hosted compiler built `tb4kvm_pico2_inert.elf` to 100%. The workflow then
asserted that the ELF was non-empty, recursively checked the build directory for
`*.uf2`, found none, and completed successfully. It did not upload the ELF or
any other firmware artifact.

The exact same repository head also passed:

- [`check` run 33549980119](https://github.com/0x63616c/tb4-kvm/actions/runs/33549980119); and
- [`pages` run 33549980146](https://github.com/0x63616c/tb4-kvm/actions/runs/33549980146).

## What this does not prove

No board was connected, flashed or booted. This result does not prove the
firmware's runtime behavior, pin state, power/backfeed behavior, USB isolation,
the physical B1–B13 controller bench, USB-C/PD/VBUS/VCONN, Thunderbolt/USB4,
the dock, either MacBook, electrical safety or compliance.

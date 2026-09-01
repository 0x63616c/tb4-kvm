# Pico 2 / RP2350 SDK binding

**Status: `PROPOSED`, bench-only build binding.** This directory now has a
named CMake target for the bare **Raspberry Pi Pico 2** (`PICO_BOARD=pico2`,
RP2350A). It is a repeatable software build setup, not flash, board, wiring,
or electrical evidence.

The target is intentionally named `tb4kvm_pico2_inert`. It starts the reviewed
portable core with no hosts observed, then remains in the Pico SDK idle loop.
It does **not** initialize GPIO, ADC, I2C, SPI, UART, USB, watchdog, LEDs,
display, USB-C/CC/PD/VBUS/VCONN, Thunderbolt/USB4, mux, retimer, storage, or
power-path hardware. It emits no state-machine event into any I/O adapter and
has both Pico SDK stdio transports disabled. Any produced build artifact is
compile evidence only; do not flash it or interpret it as bench validation.

## Pinned upstream inputs

| Input | Pin | Primary source |
| --- | --- | --- |
| Pico SDK | `2.3.0` | [Raspberry Pi Pico SDK release 2.3.0](https://github.com/raspberrypi/pico-sdk/releases/tag/2.3.0) |
| Exact SDK commit | `98a542c1a62fb549ffb5d66a3e5892b06276b670` | [Official release commit](https://github.com/raspberrypi/pico-sdk/tree/98a542c1a62fb549ffb5d66a3e5892b06276b670) |
| Board | `pico2` / RP2350A | [Pico-series C/C++ getting-started guide](https://pip-assets.raspberrypi.com/categories/610-raspberry-pi-pico/documents/RP-008276-DS-1-getting-started-with-pico.pdf) |
| Toolchain selector | `pico_arm_cortex_m33_gcc` | [Pico SDK CMake toolchain configuration](https://www.raspberrypi.com/documentation/pico-sdk/) |

Raspberry Pi documents `-DPICO_BOARD=pico2` for Pico 2. The SDK binding also
checks the official `pico2.h` board definition for the `PICO_RP2350A` marker,
so a different board or a same-version-but-different SDK checkout fails during
configuration rather than silently producing a different build.

## Build on a development computer

This requires CMake, Git, Python, and an installed Arm GNU toolchain
accepted by the Pico SDK. It requires no connected Pico, USB cable, target
KVM, dock, or bench supply.

```sh
git clone --recurse-submodules https://github.com/raspberrypi/pico-sdk.git /path/to/pico-sdk
git -C /path/to/pico-sdk checkout --detach 98a542c1a62fb549ffb5d66a3e5892b06276b670
git -C /path/to/pico-sdk submodule update --init --recursive

cd firmware/controller-pico2
cmake -DPICO_SDK_PATH=/path/to/pico-sdk -P cmake/verify-pico-sdk-pin.cmake
cmake --preset pico2-rp2350-arm-s -DPICO_SDK_PATH=/path/to/pico-sdk
cmake --build --preset pico2-rp2350-arm-s
```

The build output is under `build/pico2-rp2350-arm-s/`. This binding sets
`PICO_NO_PICOTOOL=ON`, so it never downloads or builds `picotool` and the
configured target does **not** produce a UF2 file. The exact remaining compiler
and object-copy outputs depend on the installed toolchain. Every generated ELF,
BIN, HEX, map or disassembly remains a compile artifact only; do not copy any
artifact to a board as part of this repository tranche.

## Checks without hardware

Run the portable core test on any C11 host compiler:

```sh
./test-host.sh
```

Run the SDK/board/commit configuration check after obtaining the pinned SDK:

```sh
cmake -DPICO_SDK_PATH=/path/to/pico-sdk -P cmake/verify-pico-sdk-pin.cmake
```

Neither command proves cross-compiler availability, flashing, boot behavior,
pin state, USB isolation, power behavior, or any B1–B13 bench test. An actual
cross-build additionally proves only that the named SDK/toolchain can compile
this inert source; it remains no substitute for physical evidence.

## GitHub Actions cross-build

The [`Pico 2 cross-build workflow`](../../.github/workflows/pico2-cross-build.yml)
is the reproducible CI route for the target. It runs on Ubuntu 24.04, installs
the distro Arm GCC, C Newlib and C++ Newlib packages, checks out this exact SDK commit
and all submodules, verifies the board identity, and builds the preset. It
requires no board or USB connection, performs no flash operation, uploads no
firmware artifact, and fails if an unexpected UF2 appears. The hosted distro
toolchain is an input of the CI environment; the workflow logs its compiler
version so a later toolchain change remains visible rather than silently being
treated as equivalent evidence.

Strict `-Wall -Wextra -Werror -Wpedantic` checks apply to this repository's
portable core and `main.c`, not to Pico SDK sources. The first hosted run exposed
why that boundary matters: applying the flags target-wide rejected intentional
function/object-pointer conversions in SDK 2.3.0's IRQ implementation before
our inert program could link.

The next hosted run reached the SDK's `pico_cxx_options/new_delete.cpp` and
proved that Ubuntu's separate `libstdc++-arm-none-eabi-newlib` package is also a
required build input, even though this repository's application sources are C.
The workflow therefore installs that package explicitly rather than relying on
the compiler package's recommendations.

## Next integration boundary

Before adding any low-speed I/O adapter, obtain and independently review an
exact pin/IO-ownership record and a scoped bench test procedure. Keep the
portable core's `INTENT_SELECT_HOST` abstract: it is not permission to drive a
mux, PD controller, VBUS switch, Type-C signal, Thunderbolt/USB4 path, or
product hardware.

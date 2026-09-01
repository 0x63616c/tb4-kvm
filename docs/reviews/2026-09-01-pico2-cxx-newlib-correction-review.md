# Pico 2 C++ Newlib correction review

Date: 2026-09-01

Reviewer: independent Pico cross-build release reviewer

Reviewed staged tree: `964d25a11a9551cd74f11702ce70d84b7fa84fea`

Verdict: **ACCEPT — no blockers**

## Trigger

Exact-head workflow run
[`33549559925`](https://github.com/0x63616c/tb4-kvm/actions/runs/33549559925)
confirmed the warning-scope fix and compiled to 88%. It then failed when Pico
SDK `pico_cxx_options/new_delete.cpp` could not find the C++ standard header
`cassert`.

## Disposition and review

Ubuntu 24.04 packages Arm C++ Newlib separately as
`libstdc++-arm-none-eabi-newlib`. The workflow now installs it explicitly in the
same apt transaction as Arm GCC and C Newlib.

The reviewer retracted the earlier conclusion that the C-linked application did
not need this package: the hosted build proves that `pico_stdlib` contributes
the SDK C++ support source. The reviewer confirmed the exact package exists for
Ubuntu Noble, carries the required target headers/library dependency chain, and
is the minimal complete fix. `actionlint`, staged-diff, evidence and link checks
passed.

## Remaining evidence boundary

A successful new exact-head run remains required. This package correction does
not itself prove ELF creation, the no-UF2 assertion, flashing, boot or any
physical bench behavior.

#!/bin/sh
set -eu

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
output_dir=$(mktemp -d "${TMPDIR:-/tmp}/tb4-kvm-controller-core.XXXXXX")
trap 'rm -rf "$output_dir"' EXIT HUP INT TERM

"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -pedantic \
  "$repo_dir/firmware/controller-pico2/controller_core.c" \
  "$repo_dir/firmware/controller-pico2/test_controller_core.c" \
  -o "$output_dir/controller-pico2-core"
"$output_dir/controller-pico2-core"

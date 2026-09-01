#!/bin/sh
set -eu

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
output_dir=$(mktemp -d "${TMPDIR:-/tmp}/tb4-kvm-controller-ubsan.XXXXXX")
trap 'rm -rf "$output_dir"' EXIT HUP INT TERM

# This is an opt-in host diagnostic. Keep it separate from test-host.sh because
# some supported C compilers do not provide UndefinedBehaviorSanitizer.
"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -pedantic \
  -fsanitize=undefined -fno-sanitize-recover=undefined \
  -fno-omit-frame-pointer \
  "$repo_dir/firmware/controller-pico2/controller_core.c" \
  "$repo_dir/firmware/controller-pico2/low_speed_frontend.c" \
  "$repo_dir/firmware/controller-pico2/test_low_speed_frontend.c" \
  -o "$output_dir/controller-pico2-low-speed-frontend-ubsan"
"$output_dir/controller-pico2-low-speed-frontend-ubsan"

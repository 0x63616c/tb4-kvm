#!/bin/sh
set -eu

repo_dir=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
output_dir=$(mktemp -d "${TMPDIR:-/tmp}/tb4-kvm-controller-core.XXXXXX")
trap 'rm -rf "$output_dir"' EXIT HUP INT TERM

main_source="$repo_dir/firmware/controller-pico2/main.c"
grep -Eq '^static tb4kvm_low_speed_frontend_t frontend;$' "$main_source"
if grep -Eq '^[[:space:]]+tb4kvm_low_speed_frontend_t frontend;$' "$main_source"; then
  echo 'FAIL: inert Pico frontend must not be automatic main() storage' >&2
  exit 1
fi
echo 'controller-pico2-main-storage: static/BSS frontend declaration verified (source-level only)'

"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -pedantic \
  "$repo_dir/firmware/controller-pico2/controller_core.c" \
  "$repo_dir/firmware/controller-pico2/test_controller_core.c" \
  -o "$output_dir/controller-pico2-core"
"$output_dir/controller-pico2-core"

"${CC:-cc}" -std=c11 -Wall -Wextra -Werror -pedantic \
  "$repo_dir/firmware/controller-pico2/controller_core.c" \
  "$repo_dir/firmware/controller-pico2/low_speed_frontend.c" \
  "$repo_dir/firmware/controller-pico2/test_low_speed_frontend.c" \
  -o "$output_dir/controller-pico2-low-speed-frontend"
"$output_dir/controller-pico2-low-speed-frontend"

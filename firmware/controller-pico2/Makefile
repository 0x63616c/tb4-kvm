.PHONY: test verify-sdk

test:
	./test-host.sh

verify-sdk:
	@test -n "$(PICO_SDK_PATH)" || (echo "PICO_SDK_PATH is required" >&2; exit 2)
	cmake -DPICO_SDK_PATH="$(PICO_SDK_PATH)" -P cmake/verify-pico-sdk-pin.cmake

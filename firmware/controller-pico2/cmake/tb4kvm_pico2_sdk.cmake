# Raspberry Pi Pico SDK binding for the PD-free Pico 2 bench target.
#
# The project intentionally requires a local, detached SDK checkout. It never
# enables Pico SDK's FetchContent route, which otherwise defaults to a moving
# branch. The exact release and commit below are the reproducibility boundary.

set(TB4KVM_PICO_SDK_VERSION "2.3.0")
set(TB4KVM_PICO_SDK_COMMIT "98a542c1a62fb549ffb5d66a3e5892b06276b670")

if(NOT PICO_SDK_PATH)
  message(FATAL_ERROR
          "PICO_SDK_PATH is required. Use the pinned Raspberry Pi Pico SDK "
          "${TB4KVM_PICO_SDK_VERSION} checkout at "
          "${TB4KVM_PICO_SDK_COMMIT}; see firmware/controller-pico2/README.md.")
endif()

get_filename_component(PICO_SDK_PATH "${PICO_SDK_PATH}" REALPATH
                       BASE_DIR "${CMAKE_BINARY_DIR}")

# No implicit network fetch and no board/platform substitution. pico2's board
# definition resolves this build to RP2350; arm-s is the SDK's documented
# default Arm platform for RP2350.
set(PICO_SDK_FETCH_FROM_GIT OFF CACHE BOOL
    "Do not download an unpinned Pico SDK" FORCE)
set(PICO_BOARD pico2 CACHE STRING "Pinned board: Raspberry Pi Pico 2" FORCE)
set(PICO_PLATFORM rp2350-arm-s CACHE STRING
    "Pinned platform: RP2350 Arm secure image" FORCE)
set(PICO_COMPILER pico_arm_cortex_m33_gcc CACHE STRING
    "Pinned compiler family: Arm GNU Cortex-M33" FORCE)
set(PICO_NO_PICOTOOL ON CACHE BOOL
    "No implicit picotool download or build" FORCE)

include("${CMAKE_CURRENT_LIST_DIR}/verify-pico-sdk-pin.cmake")
include("${PICO_SDK_PATH}/pico_sdk_init.cmake")

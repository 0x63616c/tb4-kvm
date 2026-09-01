# Can be run standalone with:
# cmake -DPICO_SDK_PATH=/path/to/pico-sdk -P cmake/verify-pico-sdk-pin.cmake

if(NOT DEFINED TB4KVM_PICO_SDK_VERSION)
  set(TB4KVM_PICO_SDK_VERSION "2.3.0")
endif()
if(NOT DEFINED TB4KVM_PICO_SDK_COMMIT)
  set(TB4KVM_PICO_SDK_COMMIT "98a542c1a62fb549ffb5d66a3e5892b06276b670")
endif()

if(NOT PICO_SDK_PATH)
  message(FATAL_ERROR "PICO_SDK_PATH must name a Pico SDK checkout.")
endif()

get_filename_component(PICO_SDK_PATH "${PICO_SDK_PATH}" REALPATH)
set(_tb4kvm_version_file "${PICO_SDK_PATH}/pico_sdk_version.cmake")
set(_tb4kvm_board_file "${PICO_SDK_PATH}/src/boards/include/boards/pico2.h")

foreach(_tb4kvm_required_file IN ITEMS "${_tb4kvm_version_file}"
                                      "${_tb4kvm_board_file}")
  if(NOT EXISTS "${_tb4kvm_required_file}")
    message(FATAL_ERROR
            "PICO_SDK_PATH='${PICO_SDK_PATH}' is not the expected Pico SDK "
            "layout; missing ${_tb4kvm_required_file}.")
  endif()
endforeach()

file(READ "${_tb4kvm_version_file}" _tb4kvm_version_source)
if(NOT _tb4kvm_version_source MATCHES "set\\(PICO_SDK_VERSION_MAJOR 2\\)" OR
   NOT _tb4kvm_version_source MATCHES "set\\(PICO_SDK_VERSION_MINOR 3\\)" OR
   NOT _tb4kvm_version_source MATCHES "set\\(PICO_SDK_VERSION_REVISION 0\\)")
  message(FATAL_ERROR
          "Pico SDK version source is not the required ${TB4KVM_PICO_SDK_VERSION}.")
endif()

file(READ "${_tb4kvm_board_file}" _tb4kvm_board_source)
if(NOT _tb4kvm_board_source MATCHES "#define RASPBERRYPI_PICO2" OR
   NOT _tb4kvm_board_source MATCHES "#define PICO_RP2350A 1")
  message(FATAL_ERROR
          "Pico SDK's pico2 board definition does not identify Raspberry Pi Pico 2/RP2350A.")
endif()

find_program(_tb4kvm_git git)
if(NOT _tb4kvm_git)
  message(FATAL_ERROR
          "git is required to verify the pinned Pico SDK commit, not just its version.")
endif()
execute_process(
  COMMAND "${_tb4kvm_git}" -C "${PICO_SDK_PATH}" rev-parse HEAD
  OUTPUT_VARIABLE _tb4kvm_sdk_head
  OUTPUT_STRIP_TRAILING_WHITESPACE
  RESULT_VARIABLE _tb4kvm_git_result
  ERROR_QUIET)
if(NOT _tb4kvm_git_result EQUAL 0 OR
   NOT _tb4kvm_sdk_head STREQUAL TB4KVM_PICO_SDK_COMMIT)
  message(FATAL_ERROR
          "Pico SDK must be detached at ${TB4KVM_PICO_SDK_COMMIT}; got "
          "'${_tb4kvm_sdk_head}'.")
endif()

message(STATUS "Pinned Pico SDK verified: ${TB4KVM_PICO_SDK_VERSION} "
               "(${TB4KVM_PICO_SDK_COMMIT}), board pico2/RP2350A")

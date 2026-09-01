cmake_minimum_required(VERSION 3.20)

# This target is intentionally pinned to the bare Raspberry Pi Pico 2 board.
# Do not change PICO_BOARD or PICO_PLATFORM through this project: a different
# board/platform invalidates the bounded bench assumptions documented here.
include(cmake/tb4kvm_pico2_sdk.cmake)

project(tb4kvm_controller_pico2_binding C CXX ASM)

pico_sdk_init()

add_library(tb4kvm_controller_core STATIC controller_core.c)
target_include_directories(tb4kvm_controller_core PUBLIC
                           "${CMAKE_CURRENT_LIST_DIR}")
target_compile_features(tb4kvm_controller_core PUBLIC c_std_11)
target_compile_options(tb4kvm_controller_core PRIVATE
                       -Wall -Wextra -Werror -Wpedantic)

# The binding is deliberately inert: it starts the portable state machine with
# no hosts observed, emits no physical intent, and never initializes an I/O
# peripheral. In particular it links neither USB nor UART stdio.
add_executable(tb4kvm_pico2_inert main.c)
target_link_libraries(tb4kvm_pico2_inert PRIVATE pico_stdlib
                                                tb4kvm_controller_core)
target_compile_features(tb4kvm_pico2_inert PRIVATE c_std_11)
target_compile_options(tb4kvm_pico2_inert PRIVATE
                       -Wall -Wextra -Werror -Wpedantic)
target_compile_definitions(tb4kvm_pico2_inert PRIVATE
                           TB4KVM_PICO2_INERT_BINDING=1)

# Make the absence of serial transports explicit, rather than accepting SDK
# defaults. This target has no application-visible I/O or transport endpoint.
pico_enable_stdio_usb(tb4kvm_pico2_inert 0)
pico_enable_stdio_uart(tb4kvm_pico2_inert 0)
pico_add_extra_outputs(tb4kvm_pico2_inert)

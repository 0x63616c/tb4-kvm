/*
 * Pico 2 SDK binding smoke image.
 *
 * This is intentionally not a bench controller. It configures no GPIO, ADC,
 * I2C, SPI, UART, USB, watchdog, display, LED, or external output. The only
 * state change is inside the portable RAM-only controller core.
 */

#include "controller_core.h"
#include "pico/stdlib.h"

#if !defined(RASPBERRYPI_PICO2) || !defined(PICO_RP2350A)
#error "tb4kvm_pico2_inert must compile for the Raspberry Pi Pico 2 / RP2350A"
#endif

int main(void) {
  tb4kvm_controller_t controller;

  /* No host is observed and no event or abstract intent crosses into I/O. */
  if (!tb4kvm_controller_init(&controller, false, false, NULL)) return 1;

  for (;;) {
    tight_loop_contents();
  }
}

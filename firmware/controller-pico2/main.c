/*
 * Pico 2 SDK binding smoke image.
 *
 * This is intentionally not a bench controller. It configures no GPIO, ADC,
 * I2C, SPI, UART, USB, watchdog, display, LED, or external output. The only
 * state changes are inside the portable RAM-only controller core and its
 * null-backed low-speed diagnostic projection.
 */

#include "low_speed_frontend.h"
#include "pico/stdlib.h"

/* Keep the approximately 2.1 KiB frontend in static/BSS storage, not main's
 * stack. This source-level choice avoids imposing a large stack frame on the
 * inert target; it is not runtime stack-usage evidence. */
static tb4kvm_low_speed_frontend_t frontend;

#if !defined(RASPBERRYPI_PICO2) || !defined(PICO_RP2350A)
#error "tb4kvm_pico2_inert must compile for the Raspberry Pi Pico 2 / RP2350A"
#endif

int main(void) {
  /* No host, button, pod, or peripheral is observed or driven by this target. */
  if (!tb4kvm_low_speed_frontend_init(&frontend, NULL)) return 1;

  for (;;) {
    tight_loop_contents();
  }
}

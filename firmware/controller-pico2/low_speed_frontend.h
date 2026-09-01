#ifndef TB4KVM_LOW_SPEED_FRONTEND_H
#define TB4KVM_LOW_SPEED_FRONTEND_H

/*
 * Portable low-speed bench frontend.
 *
 * This module accepts already-normalized logical button observations and
 * projects diagnostic state for a future display/UART/LED adapter. It has no
 * Pico SDK, GPIO, display, serial, USB, watchdog, ADC, USB-C, PD, VBUS, or
 * Thunderbolt code. Its inputs are never host-discovery or power-path signals,
 * and it exposes no action callback for controller intents.
 */

#include "controller_core.h"

#include <stdbool.h>
#include <stdint.h>

#define TB4KVM_LOW_SPEED_RECORD_CAPACITY 32u
#define TB4KVM_LOW_SPEED_MAX_FORWARD_GAP_MS UINT32_MAX

typedef enum {
  TB4KVM_DIAGNOSTIC_BOOT = 0,
  TB4KVM_DIAGNOSTIC_NO_HOSTS,
  TB4KVM_DIAGNOSTIC_REQUEST,
  TB4KVM_DIAGNOSTIC_FAULT,
} tb4kvm_diagnostic_t;

typedef enum {
  TB4KVM_LOW_SPEED_RECORD_RAW_LOCAL_DOWN = 0,
  TB4KVM_LOW_SPEED_RECORD_RAW_LOCAL_UP,
  TB4KVM_LOW_SPEED_RECORD_ACCEPTED_LOCAL_PRESS,
  TB4KVM_LOW_SPEED_RECORD_RAW_POD_DOWN,
  TB4KVM_LOW_SPEED_RECORD_RAW_POD_UP,
  TB4KVM_LOW_SPEED_RECORD_FORWARDED_POD_REQUEST,
} tb4kvm_low_speed_record_type_t;

typedef struct {
  uint64_t at_ms;
  tb4kvm_low_speed_record_type_t type;
} tb4kvm_low_speed_record_t;

typedef struct {
  tb4kvm_diagnostic_t diagnostic;
  tb4kvm_mode_t controller_mode;
  uint8_t record_count;
  const tb4kvm_low_speed_record_t *records;
} tb4kvm_low_speed_snapshot_t;

typedef struct {
  tb4kvm_controller_t controller;
  uint64_t last_sample_at_ms;
  uint64_t local_down_at_ms;
  bool local_down;
  bool pod_down;
  bool pod_present;
  tb4kvm_low_speed_record_t records[TB4KVM_LOW_SPEED_RECORD_CAPACITY];
  uint8_t record_count;
} tb4kvm_low_speed_frontend_t;

/*
 * Initializes an all-disconnected controller. This frontend deliberately has
 * no parameter for host presence because Type-C discovery is not GPIO input.
 */
bool tb4kvm_low_speed_frontend_init(tb4kvm_low_speed_frontend_t *frontend,
                                    const tb4kvm_config_t *config);

/*
 * Samples only logical low-speed button states at a monotonic timestamp.
 * A true button argument means an asserted request. The function returns false
 * for a null frontend, a timestamp that moves backwards, or a forward gap
 * larger than TB4KVM_LOW_SPEED_MAX_FORWARD_GAP_MS milliseconds. Rejecting an
 * oversized gap does not mutate the frontend or its controller.
 */
bool tb4kvm_low_speed_frontend_sample(tb4kvm_low_speed_frontend_t *frontend,
                                      uint64_t at_ms,
                                      bool local_button_asserted,
                                      bool pod_button_asserted,
                                      bool pod_present);

/*
 * Returns a diagnostic projection for future display/UART/LED adapters. It is
 * not a peripheral protocol and conveys no electrical or link status.
 */
tb4kvm_low_speed_snapshot_t tb4kvm_low_speed_frontend_snapshot(
    const tb4kvm_low_speed_frontend_t *frontend);

#endif

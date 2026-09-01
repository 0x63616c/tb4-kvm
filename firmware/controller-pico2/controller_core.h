#ifndef TB4_KVM_CONTROLLER_CORE_H
#define TB4_KVM_CONTROLLER_CORE_H

/*
 * Portable, PD-free controller state machine.
 *
 * This module has no SDK, GPIO, USB-C, PD, VBUS, Thunderbolt, or high-speed
 * control code. It only turns debounced low-speed observations into abstract
 * controller intents for a separately reviewed hardware boundary.
 */

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define TB4KVM_LOG_CAPACITY 32u
#define TB4KVM_INTENT_CAPACITY 64u

typedef enum {
  TB4KVM_HOST_NONE = 0,
  TB4KVM_HOST_A,
  TB4KVM_HOST_B,
} tb4kvm_host_t;

typedef enum {
  TB4KVM_MODE_SELECTED_A = 0,
  TB4KVM_MODE_SELECTED_B,
  TB4KVM_MODE_AWAIT_EJECT_A,
  TB4KVM_MODE_AWAIT_EJECT_B,
  TB4KVM_MODE_WAIT_BUTTON_A,
  TB4KVM_MODE_WAIT_BUTTON_B,
  TB4KVM_MODE_NO_HOSTS,
  TB4KVM_MODE_POWER_LOSS,
  TB4KVM_MODE_FAULT_LATCHED,
  TB4KVM_MODE_RESET_ISOLATED,
} tb4kvm_mode_t;

typedef enum {
  TB4KVM_EVENT_STARTUP = 0,
  TB4KVM_EVENT_TICK,
  TB4KVM_EVENT_HOST,
  TB4KVM_EVENT_POWER_LOSS,
  TB4KVM_EVENT_POWER_RESTORED,
  TB4KVM_EVENT_BROWNOUT,
  TB4KVM_EVENT_WATCHDOG_RESET,
  TB4KVM_EVENT_FAULT,
  TB4KVM_EVENT_FAULT_CLEAR,
  TB4KVM_EVENT_POD_PRESENT,
  TB4KVM_EVENT_POD_REQUEST,
  TB4KVM_EVENT_BUTTON_DOWN,
  TB4KVM_EVENT_BUTTON_UP,
} tb4kvm_event_type_t;

typedef struct {
  tb4kvm_event_type_t type;
  uint32_t milliseconds; /* used only by TICK */
  tb4kvm_host_t host;    /* used only by HOST */
  bool present;          /* used by HOST and POD_PRESENT */
} tb4kvm_event_t;

typedef enum {
  TB4KVM_INTENT_SELECT_HOST = 0,
  TB4KVM_INTENT_ISOLATE,
  TB4KVM_INTENT_REQUEST_STORAGE_STOP_EJECT,
} tb4kvm_intent_type_t;

typedef struct {
  tb4kvm_intent_type_t type;
  tb4kvm_host_t host; /* target host for SELECT and REQUEST */
  uint64_t at_ms;
} tb4kvm_intent_t;

typedef enum {
  TB4KVM_LOG_STARTUP = 0,
  TB4KVM_LOG_AWAIT_EJECT,
  TB4KVM_LOG_ACTIVE_REMOVED_WAIT_BUTTON,
  TB4KVM_LOG_SWITCH_CANCELLED,
  TB4KVM_LOG_STALE_TARGET_REFUSED,
  TB4KVM_LOG_REQUEST_REFUSED,
  TB4KVM_LOG_BUTTON_BOUNCE,
  TB4KVM_LOG_CONFIRM_HOLD_TOO_SHORT,
  TB4KVM_LOG_FAULT_IGNORED,
  TB4KVM_LOG_OBSERVATION,
  TB4KVM_LOG_ISOLATED,
} tb4kvm_log_code_t;

typedef struct {
  uint64_t at_ms;
  tb4kvm_log_code_t code;
  tb4kvm_mode_t mode;
} tb4kvm_log_t;

typedef struct {
  uint32_t debounce_ms;
  uint32_t confirm_hold_ms;
  uint32_t confirm_timeout_ms;
  uint8_t log_limit;
  uint8_t intent_limit;
} tb4kvm_config_t;

typedef struct {
  uint64_t now_ms;
  tb4kvm_config_t config;
  bool external_power;
  bool host_a_present;
  bool host_b_present;
  bool pod_present;
  tb4kvm_mode_t mode;
  tb4kvm_host_t selected;
  tb4kvm_host_t pending_target;
  uint64_t confirm_deadline_ms;
  bool button_down;
  uint64_t button_down_at_ms;
  tb4kvm_intent_t intents[TB4KVM_INTENT_CAPACITY];
  uint8_t intent_count;
  tb4kvm_log_t logs[TB4KVM_LOG_CAPACITY];
  uint8_t log_count;
} tb4kvm_controller_t;

/* Returns false if config cannot be represented safely by this fixed core. */
bool tb4kvm_controller_init(tb4kvm_controller_t *controller,
                            bool host_a_present,
                            bool host_b_present,
                            const tb4kvm_config_t *config);

/* Processes one observation. No event in this API drives hardware directly. */
void tb4kvm_controller_transition(tb4kvm_controller_t *controller,
                                  const tb4kvm_event_t *event);

/* Checks internal safety invariants for deterministic host tests. */
bool tb4kvm_controller_invariants_hold(const tb4kvm_controller_t *controller);

tb4kvm_config_t tb4kvm_default_config(void);

#endif

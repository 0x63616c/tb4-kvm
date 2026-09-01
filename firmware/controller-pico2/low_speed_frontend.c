#include "low_speed_frontend.h"

#include <string.h>

static void append_record(tb4kvm_low_speed_frontend_t *frontend,
                          tb4kvm_low_speed_record_type_t type) {
  if (frontend->record_count >= TB4KVM_LOW_SPEED_RECORD_CAPACITY) {
    memmove(&frontend->records[0], &frontend->records[1],
            (TB4KVM_LOW_SPEED_RECORD_CAPACITY - 1u) *
                sizeof(frontend->records[0]));
    frontend->record_count = TB4KVM_LOW_SPEED_RECORD_CAPACITY - 1u;
  }
  frontend->records[frontend->record_count++] =
      (tb4kvm_low_speed_record_t){.at_ms = frontend->last_sample_at_ms,
                                  .type = type};
}

static void transition(tb4kvm_low_speed_frontend_t *frontend,
                       tb4kvm_event_type_t type) {
  tb4kvm_controller_transition(&frontend->controller,
                               &(tb4kvm_event_t){.type = type});
}

static void advance_to(tb4kvm_low_speed_frontend_t *frontend,
                       uint32_t elapsed_ms, uint64_t at_ms) {
  if (elapsed_ms > 0u)
    tb4kvm_controller_transition(
        &frontend->controller,
        &(tb4kvm_event_t){.type = TB4KVM_EVENT_TICK,
                          .milliseconds = elapsed_ms});
  frontend->last_sample_at_ms = at_ms;
}

bool tb4kvm_low_speed_frontend_init(tb4kvm_low_speed_frontend_t *frontend,
                                    const tb4kvm_config_t *config) {
  if (frontend == NULL ||
      !tb4kvm_controller_init(&frontend->controller, false, false, config))
    return false;
  memset(&frontend->records[0], 0, sizeof(frontend->records));
  frontend->last_sample_at_ms = 0u;
  frontend->local_down_at_ms = 0u;
  frontend->local_down = false;
  frontend->pod_down = false;
  frontend->pod_present = false;
  frontend->record_count = 0u;
  return true;
}

bool tb4kvm_low_speed_frontend_sample(tb4kvm_low_speed_frontend_t *frontend,
                                      uint64_t at_ms,
                                      bool local_button_asserted,
                                      bool pod_button_asserted,
                                      bool pod_present) {
  uint64_t forward_gap;
  if (frontend == NULL || at_ms < frontend->last_sample_at_ms) return false;
  forward_gap = at_ms - frontend->last_sample_at_ms;
  if (forward_gap > TB4KVM_LOW_SPEED_MAX_FORWARD_GAP_MS) return false;
  advance_to(frontend, (uint32_t)forward_gap, at_ms);

  if (pod_present != frontend->pod_present) {
    frontend->pod_present = pod_present;
    tb4kvm_controller_transition(
        &frontend->controller,
        &(tb4kvm_event_t){.type = TB4KVM_EVENT_POD_PRESENT,
                          .present = pod_present});
  }

  if (local_button_asserted != frontend->local_down) {
    frontend->local_down = local_button_asserted;
    if (local_button_asserted) {
      frontend->local_down_at_ms = at_ms;
      append_record(frontend, TB4KVM_LOW_SPEED_RECORD_RAW_LOCAL_DOWN);
      transition(frontend, TB4KVM_EVENT_BUTTON_DOWN);
    } else {
      append_record(frontend, TB4KVM_LOW_SPEED_RECORD_RAW_LOCAL_UP);
      transition(frontend, TB4KVM_EVENT_BUTTON_UP);
      if (at_ms - frontend->local_down_at_ms >=
          frontend->controller.config.debounce_ms)
        append_record(frontend, TB4KVM_LOW_SPEED_RECORD_ACCEPTED_LOCAL_PRESS);
    }
  }

  if (pod_button_asserted != frontend->pod_down) {
    frontend->pod_down = pod_button_asserted;
    if (pod_button_asserted) {
      append_record(frontend, TB4KVM_LOW_SPEED_RECORD_RAW_POD_DOWN);
      if (frontend->pod_present) {
        transition(frontend, TB4KVM_EVENT_POD_REQUEST);
        append_record(frontend, TB4KVM_LOW_SPEED_RECORD_FORWARDED_POD_REQUEST);
      }
    } else {
      append_record(frontend, TB4KVM_LOW_SPEED_RECORD_RAW_POD_UP);
    }
  }
  return tb4kvm_controller_invariants_hold(&frontend->controller);
}

tb4kvm_low_speed_snapshot_t tb4kvm_low_speed_frontend_snapshot(
    const tb4kvm_low_speed_frontend_t *frontend) {
  tb4kvm_diagnostic_t diagnostic = TB4KVM_DIAGNOSTIC_BOOT;
  tb4kvm_mode_t mode = TB4KVM_MODE_RESET_ISOLATED;
  if (frontend != NULL) {
    mode = frontend->controller.mode;
    if (mode == TB4KVM_MODE_FAULT_LATCHED)
      diagnostic = TB4KVM_DIAGNOSTIC_FAULT;
    else if (mode == TB4KVM_MODE_AWAIT_EJECT_A ||
             mode == TB4KVM_MODE_AWAIT_EJECT_B)
      diagnostic = TB4KVM_DIAGNOSTIC_REQUEST;
    else if (mode == TB4KVM_MODE_NO_HOSTS)
      diagnostic = TB4KVM_DIAGNOSTIC_NO_HOSTS;
    return (tb4kvm_low_speed_snapshot_t){
        .diagnostic = diagnostic,
        .controller_mode = mode,
        .record_count = frontend->record_count,
        .records = frontend->records,
    };
  }
  return (tb4kvm_low_speed_snapshot_t){
      .diagnostic = diagnostic,
      .controller_mode = mode,
      .record_count = 0u,
      .records = NULL,
  };
}

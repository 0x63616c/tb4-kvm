#include "controller_core.h"

#include <string.h>

static bool host_present(const tb4kvm_controller_t *controller,
                         tb4kvm_host_t host) {
  return host == TB4KVM_HOST_A ? controller->host_a_present
                               : host == TB4KVM_HOST_B
                                     ? controller->host_b_present
                                     : false;
}

static tb4kvm_host_t other_host(tb4kvm_host_t host) {
  return host == TB4KVM_HOST_A ? TB4KVM_HOST_B
                               : host == TB4KVM_HOST_B ? TB4KVM_HOST_A
                                                        : TB4KVM_HOST_NONE;
}

static tb4kvm_mode_t selected_mode(tb4kvm_host_t host) {
  return host == TB4KVM_HOST_A ? TB4KVM_MODE_SELECTED_A
                               : TB4KVM_MODE_SELECTED_B;
}

static tb4kvm_mode_t await_mode(tb4kvm_host_t host) {
  return host == TB4KVM_HOST_A ? TB4KVM_MODE_AWAIT_EJECT_A
                               : TB4KVM_MODE_AWAIT_EJECT_B;
}

static tb4kvm_mode_t wait_mode(tb4kvm_host_t host) {
  return host == TB4KVM_HOST_A ? TB4KVM_MODE_WAIT_BUTTON_A
                               : TB4KVM_MODE_WAIT_BUTTON_B;
}

static bool is_awaiting(tb4kvm_mode_t mode) {
  return mode == TB4KVM_MODE_AWAIT_EJECT_A ||
         mode == TB4KVM_MODE_AWAIT_EJECT_B;
}

static bool is_isolated(tb4kvm_mode_t mode) {
  return mode == TB4KVM_MODE_POWER_LOSS ||
         mode == TB4KVM_MODE_FAULT_LATCHED ||
         mode == TB4KVM_MODE_RESET_ISOLATED;
}

static void record(tb4kvm_controller_t *controller, tb4kvm_log_code_t code) {
  if (controller->log_count >= controller->config.log_limit) {
    memmove(&controller->logs[0], &controller->logs[1],
            (controller->config.log_limit - 1u) * sizeof(controller->logs[0]));
    controller->log_count = (uint8_t)(controller->config.log_limit - 1u);
  }
  controller->logs[controller->log_count++] =
      (tb4kvm_log_t){controller->now_ms, code, controller->mode};
}

static void emit_intent(tb4kvm_controller_t *controller,
                        tb4kvm_intent_type_t type, tb4kvm_host_t host) {
  if (controller->intent_count >= controller->config.intent_limit) {
    memmove(&controller->intents[0], &controller->intents[1],
            (controller->config.intent_limit - 1u) *
                sizeof(controller->intents[0]));
    controller->intent_count = (uint8_t)(controller->config.intent_limit - 1u);
  }
  controller->intents[controller->intent_count++] =
      (tb4kvm_intent_t){type, host, controller->now_ms};
}

static tb4kvm_host_t startup_candidate(const tb4kvm_controller_t *controller) {
  if (controller->host_a_present) return TB4KVM_HOST_A;
  if (controller->host_b_present) return TB4KVM_HOST_B;
  return TB4KVM_HOST_NONE;
}

static void isolate(tb4kvm_controller_t *controller, tb4kvm_mode_t mode) {
  controller->mode = mode;
  controller->selected = TB4KVM_HOST_NONE;
  controller->pending_target = TB4KVM_HOST_NONE;
  controller->confirm_deadline_ms = 0u;
  controller->button_down = false;
  emit_intent(controller, TB4KVM_INTENT_ISOLATE, TB4KVM_HOST_NONE);
  record(controller, TB4KVM_LOG_ISOLATED);
}

static void select_host(tb4kvm_controller_t *controller, tb4kvm_host_t host) {
  controller->mode = selected_mode(host);
  controller->selected = host;
  controller->pending_target = TB4KVM_HOST_NONE;
  controller->confirm_deadline_ms = 0u;
  emit_intent(controller, TB4KVM_INTENT_SELECT_HOST, host);
  record(controller, TB4KVM_LOG_STARTUP);
}

static void startup(tb4kvm_controller_t *controller) {
  tb4kvm_host_t candidate;
  if (!controller->external_power) {
    isolate(controller, TB4KVM_MODE_POWER_LOSS);
    return;
  }
  candidate = startup_candidate(controller);
  if (candidate == TB4KVM_HOST_NONE) {
    isolate(controller, TB4KVM_MODE_NO_HOSTS);
    return;
  }
  select_host(controller, candidate);
}

static void request_switch(tb4kvm_controller_t *controller) {
  tb4kvm_host_t target;
  if (!controller->external_power || is_isolated(controller->mode) ||
      controller->mode == TB4KVM_MODE_NO_HOSTS || is_awaiting(controller->mode)) {
    record(controller, TB4KVM_LOG_REQUEST_REFUSED);
    return;
  }
  if (controller->mode == TB4KVM_MODE_WAIT_BUTTON_A ||
      controller->mode == TB4KVM_MODE_WAIT_BUTTON_B) {
    target = startup_candidate(controller);
  } else {
    target = other_host(controller->selected);
  }
  if (target == TB4KVM_HOST_NONE || !host_present(controller, target)) {
    record(controller, TB4KVM_LOG_REQUEST_REFUSED);
    return;
  }
  controller->pending_target = target;
  controller->confirm_deadline_ms =
      controller->now_ms + controller->config.confirm_timeout_ms;
  controller->mode = await_mode(target);
  emit_intent(controller, TB4KVM_INTENT_REQUEST_STORAGE_STOP_EJECT, target);
  record(controller, TB4KVM_LOG_AWAIT_EJECT);
}

static void cancel_pending(tb4kvm_controller_t *controller) {
  tb4kvm_host_t current = controller->selected;
  controller->pending_target = TB4KVM_HOST_NONE;
  controller->confirm_deadline_ms = 0u;
  if (current != TB4KVM_HOST_NONE && host_present(controller, current)) {
    controller->mode = selected_mode(current);
  } else if (controller->host_a_present || controller->host_b_present) {
    controller->mode = wait_mode(current == TB4KVM_HOST_NONE ? TB4KVM_HOST_A
                                                              : current);
  } else {
    controller->mode = TB4KVM_MODE_NO_HOSTS;
  }
  record(controller, TB4KVM_LOG_SWITCH_CANCELLED);
}

static void confirm_switch(tb4kvm_controller_t *controller) {
  tb4kvm_host_t target = controller->pending_target;
  if (target == TB4KVM_HOST_NONE ||
      controller->now_ms > controller->confirm_deadline_ms) {
    cancel_pending(controller);
    return;
  }
  if (!controller->external_power || !host_present(controller, target)) {
    if (!controller->host_a_present && !controller->host_b_present) {
      isolate(controller, TB4KVM_MODE_NO_HOSTS);
      return;
    }
    controller->pending_target = TB4KVM_HOST_NONE;
    controller->confirm_deadline_ms = 0u;
    if (controller->selected != TB4KVM_HOST_NONE &&
        host_present(controller, controller->selected)) {
      controller->mode = selected_mode(controller->selected);
    } else {
      controller->mode = wait_mode(other_host(target));
    }
    record(controller, TB4KVM_LOG_STALE_TARGET_REFUSED);
    return;
  }
  select_host(controller, target);
}

static void handle_host(tb4kvm_controller_t *controller, tb4kvm_host_t host,
                        bool present) {
  if (host != TB4KVM_HOST_A && host != TB4KVM_HOST_B) {
    record(controller, TB4KVM_LOG_OBSERVATION);
    return;
  }
  if (host == TB4KVM_HOST_A)
    controller->host_a_present = present;
  else
    controller->host_b_present = present;

  if (!present && controller->selected == host) {
    controller->pending_target = TB4KVM_HOST_NONE;
    controller->confirm_deadline_ms = 0u;
    if (host_present(controller, other_host(host))) {
      controller->mode = wait_mode(host);
      record(controller, TB4KVM_LOG_ACTIVE_REMOVED_WAIT_BUTTON);
    } else {
      isolate(controller, TB4KVM_MODE_NO_HOSTS);
    }
    return;
  }
  record(controller, TB4KVM_LOG_OBSERVATION);
}

static void fault_latched_event(tb4kvm_controller_t *controller,
                                const tb4kvm_event_t *event) {
  switch (event->type) {
    case TB4KVM_EVENT_HOST:
      if (event->host == TB4KVM_HOST_A)
        controller->host_a_present = event->present;
      else if (event->host == TB4KVM_HOST_B)
        controller->host_b_present = event->present;
      record(controller, TB4KVM_LOG_OBSERVATION);
      return;
    case TB4KVM_EVENT_POD_PRESENT:
      controller->pod_present = event->present;
      record(controller, TB4KVM_LOG_OBSERVATION);
      return;
    case TB4KVM_EVENT_POWER_LOSS:
    case TB4KVM_EVENT_BROWNOUT:
      controller->external_power = false;
      record(controller, TB4KVM_LOG_OBSERVATION);
      return;
    case TB4KVM_EVENT_POWER_RESTORED:
      controller->external_power = true;
      record(controller, TB4KVM_LOG_OBSERVATION);
      return;
    case TB4KVM_EVENT_TICK:
      controller->now_ms += event->milliseconds;
      record(controller, TB4KVM_LOG_OBSERVATION);
      return;
    default:
      record(controller, TB4KVM_LOG_FAULT_IGNORED);
      return;
  }
}

tb4kvm_config_t tb4kvm_default_config(void) {
  return (tb4kvm_config_t){
      .debounce_ms = 30u,
      .confirm_hold_ms = 900u,
      .confirm_timeout_ms = 5000u,
      .log_limit = TB4KVM_LOG_CAPACITY,
      .intent_limit = TB4KVM_INTENT_CAPACITY,
  };
}

bool tb4kvm_controller_init(tb4kvm_controller_t *controller,
                            bool host_a_present, bool host_b_present,
                            const tb4kvm_config_t *config) {
  tb4kvm_config_t effective = config == NULL ? tb4kvm_default_config() : *config;
  if (controller == NULL || effective.log_limit == 0u ||
      effective.log_limit > TB4KVM_LOG_CAPACITY || effective.intent_limit == 0u ||
      effective.intent_limit > TB4KVM_INTENT_CAPACITY ||
      effective.confirm_hold_ms == 0u || effective.confirm_timeout_ms == 0u ||
      effective.confirm_hold_ms > effective.confirm_timeout_ms)
    return false;
  memset(controller, 0, sizeof(*controller));
  controller->config = effective;
  controller->external_power = true;
  controller->host_a_present = host_a_present;
  controller->host_b_present = host_b_present;
  controller->mode = TB4KVM_MODE_RESET_ISOLATED;
  startup(controller);
  return true;
}

void tb4kvm_controller_transition(tb4kvm_controller_t *controller,
                                  const tb4kvm_event_t *event) {
  if (controller == NULL || event == NULL) return;
  if (controller->mode == TB4KVM_MODE_FAULT_LATCHED) {
    fault_latched_event(controller, event);
    return;
  }
  switch (event->type) {
    case TB4KVM_EVENT_STARTUP:
      startup(controller);
      break;
    case TB4KVM_EVENT_TICK:
      controller->now_ms += event->milliseconds;
      if (is_awaiting(controller->mode) &&
          controller->now_ms > controller->confirm_deadline_ms)
        cancel_pending(controller);
      else
        record(controller, TB4KVM_LOG_OBSERVATION);
      break;
    case TB4KVM_EVENT_HOST:
      handle_host(controller, event->host, event->present);
      break;
    case TB4KVM_EVENT_POWER_LOSS:
      controller->external_power = false;
      isolate(controller, TB4KVM_MODE_POWER_LOSS);
      break;
    case TB4KVM_EVENT_POWER_RESTORED:
      controller->external_power = true;
      record(controller, TB4KVM_LOG_OBSERVATION);
      break;
    case TB4KVM_EVENT_BROWNOUT:
      controller->external_power = false;
      isolate(controller, TB4KVM_MODE_RESET_ISOLATED);
      break;
    case TB4KVM_EVENT_WATCHDOG_RESET:
      isolate(controller, TB4KVM_MODE_RESET_ISOLATED);
      break;
    case TB4KVM_EVENT_FAULT:
      isolate(controller, TB4KVM_MODE_FAULT_LATCHED);
      break;
    case TB4KVM_EVENT_FAULT_CLEAR:
      record(controller, TB4KVM_LOG_FAULT_IGNORED);
      break;
    case TB4KVM_EVENT_POD_PRESENT:
      controller->pod_present = event->present;
      record(controller, TB4KVM_LOG_OBSERVATION);
      break;
    case TB4KVM_EVENT_POD_REQUEST:
      if (!controller->pod_present)
        record(controller, TB4KVM_LOG_REQUEST_REFUSED);
      else
        request_switch(controller);
      break;
    case TB4KVM_EVENT_BUTTON_DOWN:
      if (controller->button_down)
        record(controller, TB4KVM_LOG_BUTTON_BOUNCE);
      else {
        controller->button_down = true;
        controller->button_down_at_ms = controller->now_ms;
        record(controller, TB4KVM_LOG_OBSERVATION);
      }
      break;
    case TB4KVM_EVENT_BUTTON_UP: {
      uint64_t duration;
      if (!controller->button_down) {
        record(controller, TB4KVM_LOG_BUTTON_BOUNCE);
        break;
      }
      duration = controller->now_ms - controller->button_down_at_ms;
      controller->button_down = false;
      if (duration < controller->config.debounce_ms)
        record(controller, TB4KVM_LOG_BUTTON_BOUNCE);
      else if (is_awaiting(controller->mode)) {
        if (duration < controller->config.confirm_hold_ms)
          record(controller, TB4KVM_LOG_CONFIRM_HOLD_TOO_SHORT);
        else
          confirm_switch(controller);
      } else
        request_switch(controller);
      break;
    }
  }
}

bool tb4kvm_controller_invariants_hold(const tb4kvm_controller_t *controller) {
  if (controller == NULL || controller->log_count > controller->config.log_limit ||
      controller->intent_count > controller->config.intent_limit ||
      controller->config.log_limit == 0u ||
      controller->config.log_limit > TB4KVM_LOG_CAPACITY ||
      controller->config.intent_limit == 0u ||
      controller->config.intent_limit > TB4KVM_INTENT_CAPACITY ||
      controller->mode > TB4KVM_MODE_RESET_ISOLATED ||
      controller->selected > TB4KVM_HOST_B ||
      controller->pending_target > TB4KVM_HOST_B)
    return false;
  if (is_isolated(controller->mode) && controller->selected != TB4KVM_HOST_NONE)
    return false;
  if ((controller->mode == TB4KVM_MODE_NO_HOSTS) &&
      controller->selected != TB4KVM_HOST_NONE)
    return false;
  if (controller->mode == TB4KVM_MODE_SELECTED_A &&
      controller->selected != TB4KVM_HOST_A)
    return false;
  if (controller->mode == TB4KVM_MODE_SELECTED_B &&
      controller->selected != TB4KVM_HOST_B)
    return false;
  if (is_awaiting(controller->mode) &&
      controller->pending_target == TB4KVM_HOST_NONE)
    return false;
  return true;
}

#include "controller_core.h"

#include <stdio.h>
#include <stdlib.h>

static unsigned int checks = 0u;

#define CHECK(condition, message)                                              \
  do {                                                                         \
    checks++;                                                                  \
    if (!(condition)) {                                                        \
      fprintf(stderr, "FAIL: %s (line %d)\n", message, __LINE__);             \
      exit(1);                                                                 \
    }                                                                          \
  } while (0)

static void event(tb4kvm_controller_t *controller, tb4kvm_event_type_t type) {
  tb4kvm_controller_transition(controller,
                               &(tb4kvm_event_t){.type = type});
  CHECK(tb4kvm_controller_invariants_hold(controller), "invariants hold");
}

static void tick(tb4kvm_controller_t *controller, uint32_t milliseconds) {
  tb4kvm_controller_transition(
      controller,
      &(tb4kvm_event_t){.type = TB4KVM_EVENT_TICK, .milliseconds = milliseconds});
  CHECK(tb4kvm_controller_invariants_hold(controller), "tick invariants hold");
}

static void host(tb4kvm_controller_t *controller, tb4kvm_host_t which,
                 bool present) {
  tb4kvm_controller_transition(
      controller, &(tb4kvm_event_t){.type = TB4KVM_EVENT_HOST,
                                    .host = which,
                                    .present = present});
  CHECK(tb4kvm_controller_invariants_hold(controller), "host invariants hold");
}

static void press(tb4kvm_controller_t *controller, uint32_t duration_ms) {
  event(controller, TB4KVM_EVENT_BUTTON_DOWN);
  tick(controller, duration_ms);
  event(controller, TB4KVM_EVENT_BUTTON_UP);
}

static bool has_intent(const tb4kvm_controller_t *controller,
                       tb4kvm_intent_type_t type, tb4kvm_host_t host) {
  uint8_t index;
  for (index = 0u; index < controller->intent_count; ++index)
    if (controller->intents[index].type == type &&
        controller->intents[index].host == host)
      return true;
  return false;
}

static void test_startup_selection(void) {
  tb4kvm_controller_t controller;
  CHECK(tb4kvm_controller_init(&controller, true, true, NULL), "A startup init");
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_A, "startup prefers A");
  CHECK(tb4kvm_controller_init(&controller, false, true, NULL), "B startup init");
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_B, "B only selects B");
  CHECK(tb4kvm_controller_init(&controller, false, false, NULL),
        "empty startup init");
  CHECK(controller.mode == TB4KVM_MODE_NO_HOSTS, "neither selects nothing");
}

static void test_no_auto_failover(void) {
  tb4kvm_controller_t controller;
  CHECK(tb4kvm_controller_init(&controller, true, true, NULL), "init");
  host(&controller, TB4KVM_HOST_A, false);
  tick(&controller, 10000u);
  CHECK(controller.mode == TB4KVM_MODE_WAIT_BUTTON_A,
        "active A removal never auto-fails over");
  CHECK(!has_intent(&controller, TB4KVM_INTENT_SELECT_HOST, TB4KVM_HOST_B),
        "A removal emits no B selection intent");
}

static void test_request_then_confirm(void) {
  tb4kvm_controller_t controller;
  CHECK(tb4kvm_controller_init(&controller, true, true, NULL), "init");
  press(&controller, 31u);
  CHECK(controller.mode == TB4KVM_MODE_AWAIT_EJECT_B,
        "short stable press requests B acknowledgement");
  CHECK(has_intent(&controller, TB4KVM_INTENT_REQUEST_STORAGE_STOP_EJECT,
                   TB4KVM_HOST_B),
        "request creates only abstract stop/eject intent");
  press(&controller, 899u);
  CHECK(controller.mode == TB4KVM_MODE_AWAIT_EJECT_B,
        "insufficient hold cannot confirm");
  press(&controller, 900u);
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_B,
        "onboard hold confirms B selection");
}

static void test_pod_request_only(void) {
  tb4kvm_controller_t controller;
  CHECK(tb4kvm_controller_init(&controller, true, true, NULL), "init");
  event(&controller, TB4KVM_EVENT_POD_REQUEST);
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_A, "absent pod cannot request");
  tb4kvm_controller_transition(
      &controller,
      &(tb4kvm_event_t){.type = TB4KVM_EVENT_POD_PRESENT, .present = true});
  event(&controller, TB4KVM_EVENT_POD_REQUEST);
  CHECK(controller.mode == TB4KVM_MODE_AWAIT_EJECT_B,
        "present pod may make request only");
  event(&controller, TB4KVM_EVENT_POD_REQUEST);
  CHECK(controller.mode == TB4KVM_MODE_AWAIT_EJECT_B,
        "pod cannot confirm pending selection");
  press(&controller, 900u);
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_B,
        "onboard hold is the confirmation authority");
}

static void test_stale_target(void) {
  tb4kvm_controller_t controller;
  CHECK(tb4kvm_controller_init(&controller, true, true, NULL), "init");
  press(&controller, 31u);
  host(&controller, TB4KVM_HOST_B, false);
  press(&controller, 900u);
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_A,
        "stale B target leaves attached A selected");
  CHECK(!has_intent(&controller, TB4KVM_INTENT_SELECT_HOST, TB4KVM_HOST_B),
        "stale B creates no B select intent");
  CHECK(controller.logs[controller.log_count - 1u].code ==
            TB4KVM_LOG_STALE_TARGET_REFUSED,
        "stale target is explicitly recorded");
}

static void test_power_reset_and_fault_dominance(void) {
  tb4kvm_controller_t controller;
  CHECK(tb4kvm_controller_init(&controller, true, true, NULL), "init");
  event(&controller, TB4KVM_EVENT_POWER_LOSS);
  CHECK(controller.mode == TB4KVM_MODE_POWER_LOSS && !controller.external_power,
        "power loss isolates");
  event(&controller, TB4KVM_EVENT_STARTUP);
  CHECK(controller.mode == TB4KVM_MODE_POWER_LOSS, "startup denied without power");
  event(&controller, TB4KVM_EVENT_POWER_RESTORED);
  event(&controller, TB4KVM_EVENT_STARTUP);
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_A, "restore then startup works");
  event(&controller, TB4KVM_EVENT_BROWNOUT);
  CHECK(controller.mode == TB4KVM_MODE_RESET_ISOLATED && !controller.external_power,
        "brownout isolates and marks power absent");
  event(&controller, TB4KVM_EVENT_POWER_RESTORED);
  event(&controller, TB4KVM_EVENT_WATCHDOG_RESET);
  CHECK(controller.mode == TB4KVM_MODE_RESET_ISOLATED,
        "watchdog remains isolated until explicit startup");
  event(&controller, TB4KVM_EVENT_STARTUP);
  CHECK(controller.mode == TB4KVM_MODE_SELECTED_A, "watchdog recovery requires startup");
  event(&controller, TB4KVM_EVENT_FAULT);
  event(&controller, TB4KVM_EVENT_BROWNOUT);
  event(&controller, TB4KVM_EVENT_POWER_RESTORED);
  event(&controller, TB4KVM_EVENT_STARTUP);
  press(&controller, 1000u);
  CHECK(controller.mode == TB4KVM_MODE_FAULT_LATCHED && controller.selected == TB4KVM_HOST_NONE,
        "fault dominates power, startup, and button observations");
}

static void test_fixed_bounded_history(void) {
  tb4kvm_controller_t controller;
  tb4kvm_config_t config = tb4kvm_default_config();
  unsigned int index;
  config.log_limit = 4u;
  config.intent_limit = 3u;
  CHECK(tb4kvm_controller_init(&controller, true, true, &config), "bounded init");
  for (index = 0u; index < 20u; ++index) tick(&controller, 1u);
  CHECK(controller.log_count == 4u, "logs use a fixed bounded buffer");
  for (index = 0u; index < 20u; ++index) event(&controller, TB4KVM_EVENT_STARTUP);
  CHECK(controller.intent_count == 3u, "intents use a fixed bounded buffer");
}

int main(void) {
  test_startup_selection();
  test_no_auto_failover();
  test_request_then_confirm();
  test_pod_request_only();
  test_stale_target();
  test_power_reset_and_fault_dominance();
  test_fixed_bounded_history();
  printf("controller-pico2-core: %u checks passed\n", checks);
  return 0;
}

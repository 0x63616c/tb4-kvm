#include "low_speed_frontend.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static unsigned int checks = 0u;

#define CHECK(condition, message)                                              \
  do {                                                                         \
    checks++;                                                                  \
    if (!(condition)) {                                                        \
      fprintf(stderr, "FAIL: %s (line %d)\n", message, __LINE__);             \
      exit(1);                                                                 \
    }                                                                          \
  } while (0)

static bool sample(tb4kvm_low_speed_frontend_t *frontend, uint64_t at_ms,
                   bool local, bool pod, bool pod_present) {
  bool result = tb4kvm_low_speed_frontend_sample(frontend, at_ms, local, pod,
                                                  pod_present);
  CHECK(result, "frontend sample succeeds and retains core invariants");
  return result;
}

static unsigned int count_records(const tb4kvm_low_speed_frontend_t *frontend,
                                  tb4kvm_low_speed_record_type_t type) {
  uint8_t index;
  unsigned int count = 0u;
  for (index = 0u; index < frontend->record_count; ++index)
    if (frontend->records[index].type == type) ++count;
  return count;
}

static bool has_select_intent(const tb4kvm_low_speed_frontend_t *frontend) {
  uint8_t index;
  for (index = 0u; index < frontend->controller.intent_count; ++index)
    if (frontend->controller.intents[index].type == TB4KVM_INTENT_SELECT_HOST)
      return true;
  return false;
}

static void test_disconnected_init_and_snapshot(void) {
  tb4kvm_low_speed_frontend_t frontend;
  tb4kvm_low_speed_snapshot_t snapshot;
  CHECK(tb4kvm_low_speed_frontend_init(&frontend, NULL), "frontend init");
  CHECK(frontend.controller.host_a_present == false &&
            frontend.controller.host_b_present == false,
        "frontend cannot declare hosts present");
  CHECK(frontend.controller.mode == TB4KVM_MODE_NO_HOSTS,
        "frontend begins with no hosts");
  CHECK(!has_select_intent(&frontend), "init emits no host selection intent");
  snapshot = tb4kvm_low_speed_frontend_snapshot(&frontend);
  CHECK(snapshot.diagnostic == TB4KVM_DIAGNOSTIC_NO_HOSTS,
        "no-host condition is a diagnostic-only projection");
  CHECK(snapshot.records == frontend.records && snapshot.record_count == 0u,
        "snapshot exposes bounded structured records only");
}

static void test_local_raw_and_debounced_records(void) {
  tb4kvm_low_speed_frontend_t frontend;
  CHECK(tb4kvm_low_speed_frontend_init(&frontend, NULL), "frontend init");
  sample(&frontend, 1u, true, false, false);
  sample(&frontend, 10u, false, false, false);
  sample(&frontend, 20u, true, false, false);
  sample(&frontend, 50u, false, false, false);
  CHECK(count_records(&frontend, TB4KVM_LOW_SPEED_RECORD_RAW_LOCAL_DOWN) == 2u,
        "each local falling edge is retained as raw evidence");
  CHECK(count_records(&frontend, TB4KVM_LOW_SPEED_RECORD_RAW_LOCAL_UP) == 2u,
        "each local rising edge is retained as raw evidence");
  CHECK(count_records(&frontend,
                      TB4KVM_LOW_SPEED_RECORD_ACCEPTED_LOCAL_PRESS) == 1u,
        "only a stable local press is recorded as accepted");
  CHECK(frontend.controller.mode == TB4KVM_MODE_NO_HOSTS,
        "local controls cannot invent a connected host");
  CHECK(!has_select_intent(&frontend),
        "local controls cannot create a host-selection action");
}

static void test_pod_is_request_only(void) {
  tb4kvm_low_speed_frontend_t frontend;
  CHECK(tb4kvm_low_speed_frontend_init(&frontend, NULL), "frontend init");
  sample(&frontend, 1u, false, true, false);
  sample(&frontend, 2u, false, false, false);
  CHECK(count_records(&frontend,
                      TB4KVM_LOW_SPEED_RECORD_FORWARDED_POD_REQUEST) == 0u,
        "absent pod cannot forward a request");
  sample(&frontend, 3u, false, false, true);
  sample(&frontend, 4u, false, true, true);
  sample(&frontend, 5u, false, false, true);
  CHECK(count_records(&frontend, TB4KVM_LOW_SPEED_RECORD_RAW_POD_DOWN) == 2u,
        "pod raw edges remain separately visible");
  CHECK(count_records(&frontend,
                      TB4KVM_LOW_SPEED_RECORD_FORWARDED_POD_REQUEST) == 1u,
        "present pod forwards one request only");
  CHECK(frontend.controller.mode == TB4KVM_MODE_NO_HOSTS,
        "pod request cannot select a nonexistent host");
  CHECK(!has_select_intent(&frontend),
        "pod has no host-selection output authority");
}

static void test_time_and_fault_projection(void) {
  tb4kvm_low_speed_frontend_t frontend;
  tb4kvm_low_speed_snapshot_t snapshot;
  CHECK(tb4kvm_low_speed_frontend_init(&frontend, NULL), "frontend init");
  sample(&frontend, 5u, false, false, false);
  CHECK(!tb4kvm_low_speed_frontend_sample(&frontend, 1u, false, false, false),
        "timestamp cannot move backwards");
  tb4kvm_controller_transition(
      &frontend.controller, &(tb4kvm_event_t){.type = TB4KVM_EVENT_FAULT});
  snapshot = tb4kvm_low_speed_frontend_snapshot(&frontend);
  CHECK(snapshot.diagnostic == TB4KVM_DIAGNOSTIC_FAULT,
        "fault dominates diagnostic projection");
  CHECK(snapshot.controller_mode == TB4KVM_MODE_FAULT_LATCHED,
        "snapshot preserves the core fault state");
  CHECK(!has_select_intent(&frontend),
        "fault projection cannot create a host-selection action");
}

static void test_forward_gap_bound(void) {
  tb4kvm_low_speed_frontend_t frontend;
  tb4kvm_low_speed_frontend_t before_rejected_sample;
  CHECK(tb4kvm_low_speed_frontend_init(&frontend, NULL), "frontend init");
  CHECK(tb4kvm_low_speed_frontend_sample(
            &frontend, TB4KVM_LOW_SPEED_MAX_FORWARD_GAP_MS, false, false,
            false),
        "exactly UINT32_MAX milliseconds is an accepted forward gap");
  CHECK(frontend.last_sample_at_ms == UINT32_MAX &&
            frontend.controller.now_ms == UINT32_MAX,
        "accepted boundary advances frontend and controller time exactly once");

  CHECK(tb4kvm_low_speed_frontend_init(&frontend, NULL),
        "frontend re-init for rejected boundary");
  before_rejected_sample = frontend;
  CHECK(!tb4kvm_low_speed_frontend_sample(
            &frontend, (uint64_t)UINT32_MAX + 1u, true, true, true),
        "UINT32_MAX plus one milliseconds is rejected");
  CHECK(memcmp(&frontend, &before_rejected_sample,
               sizeof(frontend)) == 0,
        "rejected oversized gap leaves all frontend and controller state unchanged");
}

int main(void) {
  test_disconnected_init_and_snapshot();
  test_local_raw_and_debounced_records();
  test_pod_is_request_only();
  test_time_and_fault_projection();
  test_forward_gap_bound();
  printf("controller-pico2-low-speed-frontend: %u checks passed\n", checks);
  return 0;
}

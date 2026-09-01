declare module '@/firmware/controller-prototype/model.mjs' {
  export type ControllerMode =
    | 'SELECTED_A'
    | 'SELECTED_B'
    | 'AWAIT_EJECT_A'
    | 'AWAIT_EJECT_B'
    | 'WAIT_BUTTON_A'
    | 'WAIT_BUTTON_B'
    | 'NO_HOSTS'
    | 'POWER_LOSS'
    | 'FAULT_LATCHED'
    | 'RESET_ISOLATED';

  export type ControllerEvent = {
    type: string;
    host?: 'A' | 'B';
    present?: boolean;
    ms?: number;
    at?: number;
  };

  export type ControllerIntent = {
    type:
      | 'SELECT_HOST_INTENT'
      | 'ISOLATE_INTENT'
      | 'REQUEST_STORAGE_STOP_EJECT';
    at: number;
    host?: 'A' | 'B';
    target?: 'A' | 'B';
    source?: string;
    reason?: string;
  };

  export type ControllerLog = {
    at: number;
    code: string;
    detail: string;
    mode: ControllerMode;
  };

  export type ControllerState = {
    now: number;
    config: {
      debounceMs: number;
      confirmHoldMs: number;
      confirmTimeoutMs: number;
      eventLogLimit: number;
      intentHistoryLimit: number;
    };
    externalPower: boolean;
    hosts: { A: boolean; B: boolean };
    podPresent: boolean;
    mode: ControllerMode;
    selected: 'A' | 'B' | null;
    pendingTarget: 'A' | 'B' | null;
    confirmDeadline: number | null;
    buttonDownAt: number | null;
    intents: ControllerIntent[];
    log: ControllerLog[];
  };

  export const CONFIG: Readonly<ControllerState['config']>;
  export function createState(options?: {
    hostA?: boolean;
    hostB?: boolean;
    config?: Partial<ControllerState['config']>;
  }): ControllerState;
  export function transition(
    state: ControllerState,
    event: ControllerEvent,
  ): ControllerState;
  export function displayState(state: ControllerState): {
    led: string;
    display: string;
  };
  export function assertInvariants(state: ControllerState): void;
}

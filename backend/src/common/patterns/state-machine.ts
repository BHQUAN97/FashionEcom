/**
 * Generic State Machine pattern — reuse cho Order, RMA, PO, Warehouse Transfer
 * Dinh nghia transitions + side effects cho moi chuyen trang thai
 */

export interface StateTransition<TState extends number | string> {
  from: TState;
  to: TState;
  // Side effect function — chay khi transition xay ra
  onTransition?: (context: Record<string, unknown>) => Promise<void>;
}

export interface StateMachineConfig<TState extends number | string> {
  transitions: StateTransition<TState>[];
  labels?: Record<TState, string>;
}

export class StateMachine<TState extends number | string> {
  private transitionMap: Map<string, StateTransition<TState>> = new Map();
  private labels: Record<TState, string>;

  constructor(private config: StateMachineConfig<TState>) {
    this.labels = config.labels || ({} as Record<TState, string>);
    // Build transition map: "from->to" => transition
    for (const t of config.transitions) {
      this.transitionMap.set(`${t.from}->${t.to}`, t);
    }
  }

  /**
   * Kiem tra chuyen trang thai co hop le khong
   */
  canTransition(from: TState, to: TState): boolean {
    return this.transitionMap.has(`${from}->${to}`);
  }

  /**
   * Lay danh sach trang thai co the chuyen tu trang thai hien tai
   */
  getAvailableTransitions(from: TState): TState[] {
    const result: TState[] = [];
    for (const [key] of this.transitionMap) {
      const [f] = key.split('->');
      if (String(f) === String(from)) {
        const t = this.transitionMap.get(key)!;
        result.push(t.to);
      }
    }
    return result;
  }

  /**
   * Thuc hien chuyen trang thai + chay side effects
   */
  async transition(
    from: TState,
    to: TState,
    context: Record<string, unknown> = {},
  ): Promise<void> {
    const key = `${from}->${to}`;
    const t = this.transitionMap.get(key);
    if (!t) {
      const fromLabel = this.labels[from] || from;
      const toLabel = this.labels[to] || to;
      throw new Error(
        `Khong the chuyen tu "${fromLabel}" sang "${toLabel}"`,
      );
    }
    if (t.onTransition) {
      await t.onTransition(context);
    }
  }

  /**
   * Lay ten hien thi cua trang thai
   */
  getLabel(state: TState): string {
    return this.labels[state] || String(state);
  }
}

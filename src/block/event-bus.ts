type Callback = (...args: number[]) => void;

export class EventBus<EventNames extends string = string> {
  listeners: Record<EventNames, Callback[]> = {} as Record<
    EventNames,
    Callback[]
  >;

  on(event: EventNames, callback: Callback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: EventNames, callback: Callback): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  emit(event: EventNames, ...args: any[]): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }
    this.listeners[event].forEach((listener) => {
      listener(...args);
    });
  }
}

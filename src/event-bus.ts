type EventName = string;
type Callback = (...args: number[]) => void;

class EventBus {
  listeners: Record<EventName, Callback[]>;

  constructor() {
    this.listeners = {};
  }

  on(event: EventName, callback: Callback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: EventName, callback: Callback): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }
    this.listeners[event] = this.listeners[event].filter(
      (listener) => listener !== callback
    );
  }

  emit(event: EventName, ...args: any[]): void {
    if (!this.listeners[event]) {
      throw new Error(`Нет события: ${event}`);
    }
    this.listeners[event].forEach((listener) => {
      listener(...args);
    });
  }
}

const eventBus = new EventBus();

const handlerEvent1 = (arg1: number, arg2: number) => {
  console.log("first", arg1, arg2);
};

const handlerEvent2 = (arg1: number, arg2: number) => {
  console.log("second", arg1, arg2);
};

try {
  eventBus.emit("common:event-1", 42, 10);
} catch (error) {
  console.log(error); // Error: Нет события: common:event-1
}

// @ts-ignore
eventBus.on("common:event-1", handlerEvent1);
// @ts-ignore
eventBus.on("common:event-1", handlerEvent2);

eventBus.emit("common:event-1", 42, 10);
// @ts-ignore
eventBus.off("common:event-1", handlerEvent2);

eventBus.emit("common:event-1", 84, 20);

/*
	* Вывод в консоли должен быть следующий:
Error: Нет события: common:event-1
first 42 10
second 42 10
first 84 20
*/

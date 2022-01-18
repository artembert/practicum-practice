import { EventBus } from "./event-bus";

export class Block<Props extends object = {}> {
  static EVENTS = {
    INIT: "init",
    FLOW_CDM: "flow:component-did-mount",
    FLOW_RENDER: "flow:render",
    FLOW_CDU: "flow:component-did-update",
  } as const;

  _element: HTMLElement | null = null;
  _meta: { tagName: string; props: Props };

  props: Props;
  eventBus: () => EventBus;

  constructor(tagName: string = "div", props: Props) {
    const eventBus = new EventBus();
    this._meta = {
      tagName,
      props,
    };

    this.props = this._makePropsProxy(props);

    this.eventBus = () => eventBus;

    this._registerEvents(eventBus);
    eventBus.emit(Block.EVENTS.INIT);
  }

  _registerEvents(eventBus: EventBus): void {
    eventBus.on(Block.EVENTS.INIT, this.init.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDM, this._componentDidMount.bind(this));
    eventBus.on(Block.EVENTS.FLOW_CDU, this._componentDidUpdate.bind(this));
    eventBus.on(Block.EVENTS.FLOW_RENDER, this._render.bind(this));
  }

  _createResources() {
    const { tagName } = this._meta;
    this._element = this._createDocumentElement(tagName);
  }

  init() {
    this._createResources();
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  _componentDidMount() {
    this.componentDidMount();
    this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
  }

  // Может переопределять пользователь, необязательно трогать
  componentDidMount(oldProps?: Props) {}

  dispatchComponentDidMount() {
    this.eventBus().emit(Block.EVENTS.FLOW_CDM);
  }

  _componentDidUpdate(oldProps: Props, newProps: Props): void {
    const response = this.componentDidUpdate(oldProps, newProps);
    if (response) {
      this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
    }
  }

  // Может переопределять пользователь, необязательно трогать
  componentDidUpdate(oldProps: Props, newProps: Props): boolean {
    return oldProps !== newProps;
  }

  setProps = (nextProps: Props) => {
    if (!nextProps) {
      return;
    }

    return {...this.props, nextProps};
  };

  get element(): HTMLElement | null {
    return this._element;
  }

  _render() {
    const block = this.render();
    // Этот небезопасный метод для упрощения логики
    // Используйте шаблонизатор из npm или напишите свой безопасный
    // Нужно не в строку компилировать (или делать это правильно),
    // либо сразу в DOM-элементы возвращать из compile DOM-ноду
    if (this._element) {
      this._element.innerHTML = block;
    }
  }

  // Может переопределять пользователь, необязательно трогать
  render(): string {
    const tag = this._meta.tagName;
    return `<${tag}></${tag}>`;
  }

  getContent(): HTMLElement | null {
    return this.element;
  }

  _makePropsProxy(props: Props): Props {
    const self = this;
    return new Proxy<Props>(props, {
      set: (
        target: Partial<Props>,
        prop: string | symbol,
        value: any
      ): boolean => {
        target[prop as keyof typeof target] = value;
        this.eventBus().emit(Block.EVENTS.FLOW_RENDER);
        return true;
      },
      deleteProperty(): boolean {
        throw new Error("Нет доступа");
      },
    });
  }

  _createDocumentElement(tagName: string) {
    // Можно сделать метод, который через фрагменты в цикле создаёт сразу несколько блоков
    return document.createElement(tagName);
  }

  show() {
    if (!this._element) {
      return;
    }
    this._element.style.display = "block";
  }

  hide() {
    if (!this._element) {
      return;
    }
    this._element.style.display = "none";
  }
}

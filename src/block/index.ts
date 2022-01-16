import { Block } from "./block";

interface ButtonProps {
  text?: string;
}

class Button extends Block<ButtonProps> {
  constructor(props: ButtonProps) {
    // Создаём враппер дом-элемент button
    super("button", props);
  }

  override render() {
    // В проекте должен быть ваш собственный шаблонизатор
    return `<div>${this.props.text}</div>`;
  }
}

function render(query: string, block: Block) {
  const root = document.querySelector(query);
  if (!root) {
    throw new Error(`Root element does not found: ${query}`);
  }
  const content = block.getContent();
  if (content) {
    root.appendChild(content);
  }
  return root;
}

const button = new Button({
  text: "Click me",
});

// app — это class дива в корне DOM
render(".app", button);

// Через секунду контент изменится сам, достаточно обновить пропсы
setTimeout(() => {
  button.setProps({
    text: "Click me, please",
  });
}, 1000);

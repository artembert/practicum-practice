type Props = {
  name: string;
  chat: string;
  _privateProp: string;
  getChat: () => any;
  _privateMethod: () => any;
  __privateMethodToo: () => any;
};

const props: Partial<Props> = {
  name: "Abby",
  chat: "the last of us. Part II",
  getChat() {
    this._privateMethod();
  },
  _privateMethod() {
    console.log(this._privateProp);
  },
  __privateMethodToo() {},
  _privateProp: "Нельзя получить просто так",
};

const proxyProps = new Proxy(props, {
  get(target: Partial<Props>, prop: string | symbol): boolean {
    if (prop.toString().indexOf("_") === 0) {
      throw new Error("Нет прав");
    }
    const value = target[prop];
    return typeof value === "function" ? value.bind(target) : value;
  },
  set(target: Partial<Props>, prop: string | symbol, value: any): boolean {
    if (prop.toString().indexOf("_") === 0) {
      throw new Error("Нет прав");
    }
    target[prop] = value;
    return true;
  },
  deleteProperty(target: Partial<Props>, prop: string | symbol): boolean {
    if (prop.toString().indexOf("_") === 0) {
      throw new Error("Нет прав");
    }
    if ((target as object).hasOwnProperty(prop)) {
      delete target[prop];
      return true;
    }
    return false;
  },
});

proxyProps.getChat(); // "Нельзя получить просто так"
delete proxyProps.chat;

proxyProps.newProp = 2;
console.log(proxyProps.newProp); // 2

try {
  proxyProps._newPrivateProp = "Super game";
} catch (error) {
  console.log(error); // Error: Нет прав
}

try {
  delete proxyProps._privateProp;
} catch (error) {
  console.log(error); // Error: Нет прав
}

/*
	* Вывод в консоль следующий:
Нельзя получить просто так
2
Error: Нет прав
Error: Нет прав
*/

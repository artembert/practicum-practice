const enum METHOD {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

type RequestHeaders = Record<string, string>;

type Options = {
  method: METHOD;
  data?: any;
  timeout?: number;
  headers?: RequestHeaders;
};

type OptionsWithoutMethod = Omit<Options, "method">;

class HTTPTransport {
  get(url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> {
    const updatedUrl = options.data ? url + queryStringify(options.data) : url;
    return this.request(updatedUrl, { ...options, method: METHOD.GET }, options.timeout);
  }

  put(url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> {
    return this.request(url, { ...options, method: METHOD.PUT }, options.timeout);
  }

  post(url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> {
    return this.request(url, { ...options, method: METHOD.POST }, options.timeout);
  }

  delete(url: string, options: OptionsWithoutMethod = {}): Promise<XMLHttpRequest> {
    return this.request(url, { ...options, method: METHOD.DELETE }, options.timeout);
  }

  request(
    url: string,
    options: Options = { method: METHOD.GET },
    timeout = 5000
  ): Promise<XMLHttpRequest> {
    const { method, data } = options;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject("No method provided");
        return;
      }
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      setHeaders(xhr, options.headers);

      xhr.onload = () => {
        resolve(xhr);
      };

      xhr.onabort = reject;
      xhr.onerror = reject;
      xhr.ontimeout = reject;

      xhr.timeout = timeout;
      if (method === METHOD.GET || !data) {
        xhr.send();
      } else {
        xhr.send(data);
      }
    });
  }
}

/**
 * Функцию реализовывать здесь необязательно, но может помочь не плодить логику у GET-метода
 * На входе: объект. Пример: {a: 1, b: 2, c: {d: 123}, k: [1, 2, 3]}
 * На выходе: строка. Пример: ?a=1&b=2&c=[object Object]&k=1,2,3
 */
function queryStringify(data: Record<string | number, any>): string {
  if (typeof data !== "object") {
    throw new Error("Data must be object");
  }
  const queryParams = Object.entries(data).map(([key, value]) => `${key}=${value.toString()}`);
  return "?" + queryParams.join("&");
}

function setHeaders(xhr: XMLHttpRequest, headers?: RequestHeaders): void {
  if (!headers) {
    return;
  }
  Object.entries(headers).forEach(([key, value]) => {
    xhr.setRequestHeader(key, value);
  });
}

export class VueFormError extends Error {
  constructor(message: string) {
    super();
    Object.defineProperties(this, {
      name: {
        value: this.constructor.name,
      },
      message: {
        value: message,
      },
    });
    if ((Error as any).captureStackTrace)
      (Error as any).captureStackTrace(this, this.constructor);
  }
}

export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

export function isObject<T = object>(source: any): source is T {
  return source && typeof source === 'object' ? true : false;
}

export const noop = () => {
  //
};

export function getPropertyDescriptor(o: any, propertyName: PropertyKey) {
  let proto: any = o;
  let descriptor: PropertyDescriptor | undefined = undefined;
  while (proto && !descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(proto, propertyName);
    proto = Object.getPrototypeOf(proto);
  }
  return descriptor;
}

export function isPlainObject(obj: any): boolean {
  if (
    typeof obj !== 'object' ||
    obj === null ||
    // window/navigator/Global
    Object.prototype.toString.call(obj) !== '[object Object]'
  ) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  if (proto === null) {
    return true;
  }
  const ctor =
    Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (
    typeof ctor === 'function' &&
    ctor instanceof ctor &&
    ctor.toString() === Object.toString()
  );
}

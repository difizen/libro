export function validateProperty(
  object: any,
  name: string,
  typeName?: string,
  values: any[] = [],
): void {
  // eslint-disable-next-line no-prototype-builtins
  if (!object.hasOwnProperty(name)) {
    throw new Error(`Missing property '${name}`);
  }
  const value = object[name];
  if (typeName !== void 0) {
    let valid = true;
    if (typeName === 'array') {
      valid = Array.isArray(value);
    } else if (typeName === 'object') {
      valid = typeof value !== 'undefined';
    } else {
      valid = typeof value === typeName;
    }
    if (!valid) {
      throw new Error(`Property '${name}' is not of type '${typeName}'`);
    }
    if (values.length > 0) {
      let isValid = true;
      if (['string', 'number', 'boolean'].includes(typeName)) {
        isValid = values.includes(value);
      } else {
        isValid = values.findIndex((v) => v === value) >= 0;
      }
      if (!isValid) {
        throw new Error(
          `Property '${name}' is not one of the valid values ${JSON.stringify(values)}`,
        );
      }
    }
  }
}

import { realTypeOf } from './utils';

function hashString (value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash &= hash;
  }
  return hash;
}

/** Gets a value hash independent of array and object key order. */
export function getOrderIndependentHash (value: unknown): number {
  const type = realTypeOf(value);

  if (Array.isArray(value)) {
    const sum = value.reduce(
      (total, item) => total + getOrderIndependentHash(item),
      0,
    );
    return sum + hashString(`[type: array, hash: ${sum}]`);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).reduce((total, [key, item]) => {
      const description = `[ type: object, key: ${key}, value hash: ${getOrderIndependentHash(item)}]`;
      return total + hashString(description);
    }, 0);
  }

  return hashString(`[ type: ${type} ; value: ${String(value)}]`);
}

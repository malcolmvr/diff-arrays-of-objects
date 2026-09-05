export type RuntimeType =
  | 'array'
  | 'date'
  | 'math'
  | 'null'
  | 'object'
  | 'regexp'
  | 'bigint'
  | 'boolean'
  | 'function'
  | 'number'
  | 'string'
  | 'symbol'
  | 'undefined';

export function arrayRemove<T> (items: T[], from: number, to = from): T[] {
  const rest = items.slice((to || from) + 1 || items.length);
  items.length = from < 0 ? items.length + from : from;
  items.push(...rest);
  return items;
}

export function realTypeOf (subject: unknown): RuntimeType {
  const type = typeof subject;
  if (type !== 'object') return type;
  if (subject === Math) return 'math';
  if (subject === null) return 'null';
  if (Array.isArray(subject)) return 'array';
  if (subject instanceof Date) return 'date';
  if (subject instanceof RegExp) return 'regexp';
  return 'object';
}

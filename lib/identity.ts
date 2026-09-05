import { difference, keyBy, map } from 'lodash';

/** Extracts the id of an object using the configured id field. */
export function getId<T> (idField: string): (item: T) => string | number {
  return (item: T) => (item as Record<string, string | number>)[idField];
}

/** Indexes an array of objects by their id field. */
export function indexById<T> (
  items: readonly T[],
  idField: string,
): Record<string, T> {
  return keyBy(items, getId<T>(idField));
}

/** Computes the items in `first` whose ids are absent from `second`. */
export function findRemoved<T> (
  first: readonly T[],
  second: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
): T[] {
  const firstIds = first.map(getId<T>(idField));
  const secondIds = new Set(second.map(getId<T>(idField)));
  const removedIds = difference(firstIds, [...secondIds]);
  return map(removedIds, (id: string | number) => firstIndex[String(id)]);
}

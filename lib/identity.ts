/** Extracts the id of an object using the configured id field. */
export function getId<T extends object> (idField: string) {
  return (item: T): unknown => Reflect.get(item, idField);
}

/** Indexes an array of objects by their id field. */
export function indexById<T extends object> (
  items: readonly T[],
  idField: string,
): Record<string, T> {
  const index: Record<string, T> = Object.create(null);
  for (const item of items) index[String(getId(idField)(item))] = item;
  return index;
}

/** Computes the items in `first` whose ids are absent from `second`. */
export function findRemoved<T extends object> (
  first: readonly T[],
  second: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
): T[] {
  const secondIds = new Set(second.map(item => String(getId(idField)(item))));
  return first
    .map(item => String(getId(idField)(item)))
    .filter(id => !secondIds.has(id))
    .map(id => firstIndex[id])
    .filter((item): item is T => item !== undefined);
}

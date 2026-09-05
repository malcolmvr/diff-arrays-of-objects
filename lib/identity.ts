/** Extracts the id of an object using the configured id field. */
export function getId<T extends object> (idField: string) {
  return (item: T): unknown => Reflect.get(item, idField);
}

/** Indexes an array of objects by their id field. */
export function indexById<T extends object> (
  items: readonly T[],
  idField: string,
): Record<string, T> {
  return Object.fromEntries(
    items.map(item => [String(getId(idField)(item)), item]),
  );
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

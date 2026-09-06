const token = Symbol('shared fixture token');
const callback = (value: number): number => value + 1;

/** Independently allocated, deterministic fixtures; no JSON cloning loses types. */
export function mixedEntry (id: number) {
  return {
    id,
    text: `record-${id}`,
    count: id * 1.5,
    enabled: id % 2 === 0,
    largeInteger: BigInt(id) * BigInt('9007199254740993'),
    empty: null,
    missing: undefined,
    notANumber: NaN,
    infinity: Infinity,
    token,
    callback,
    date: new Date(1700000000000 + id),
    pattern: new RegExp(`record-${id}`, 'gi'),
    map: new Map<string, unknown>([
      ['count', id], ['metadata', { label: `map-${id}`, values: [id, id + 1] }],
    ]),
    set: new Set<unknown>([id, `tag-${id}`, { enabled: true }]),
    values: [id, `value-${id}`, null, undefined, true],
    matrix: [[id, id + 1], [id + 2, id + 3]],
    nested: { metadata: { label: `nested-${id}`, tags: ['one', 'two'] } },
    removable: true,
  };
}

export function mixedObject (size: number) {
  return {
    id: 'large-object',
    entries: Array.from({ length: size }, (_, index) => mixedEntry(index)),
  };
}

/** Eight edits plus a property addition and deletion per selected entry. */
export function changeMixedObject (value: ReturnType<typeof mixedObject>, stride = 1): void {
  for (let index = 0; index < value.entries.length; index += stride) {
    const entry = value.entries[index]!;
    entry.text += '-changed';
    entry.count++;
    entry.enabled = !entry.enabled;
    entry.largeInteger += BigInt(1);
    entry.date = new Date(entry.date.getTime() + 1000);
    entry.pattern = /changed/m;
    entry.map.set('count', -1);
    entry.set.add('changed');
    Reflect.deleteProperty(entry, 'removable');
    Reflect.set(entry, 'added', { value: 'new' });
  }
}

export function nestedArrays (depth: number): unknown[] {
  let value: unknown[] = [1];
  for (let index = 1; index < depth; index++) value = [value];
  return value;
}

import { groupBy } from 'lodash';
import { getId } from './identity';

export interface Classification<T> {
  added: T[];
  same: T[];
  updated: T[];
}

/**
 * Classifies every object in `second` as added, same or updated,
 * relative to the objects indexed from `first`.
 */
export function classify<T> (
  second: readonly T[],
  firstIndex: Record<string, T>,
  idField: string,
  compareFunction: (a: T, b: T) => boolean,
): Classification<T> {
  const groupingFunction = (o2: T): string => {
    const o1 = firstIndex[String(getId<T>(idField)(o2))];
    if (!o1) return 'added';
    if (compareFunction(o1, o2)) return 'same';
    return 'updated';
  };

  return {
    added: [],
    same: [],
    updated: [],
    ...groupBy(second, groupingFunction),
  };
}

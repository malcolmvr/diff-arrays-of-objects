/** Minimal structural description of a vendored deep-diff change. */
export type DiffKind = 'N' | 'E' | 'A' | 'D';

export interface Diff {
  readonly kind: DiffKind;
  readonly path?: (string | number)[];
  readonly index?: number;
  readonly item?: Diff;
  readonly lhs?: unknown;
  readonly rhs?: unknown;
}

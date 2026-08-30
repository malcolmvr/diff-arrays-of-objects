/** Minimal structural description of a deep-diff change.
 *
 * The vendored `deep-diff.ts` module builds objects with a `kind` discriminant
 * plus optional `path`, `index`, `item`, `lhs` and `rhs` fields. We only need
 * the shape, not the runtime implementation, so we describe it structurally
 * instead of importing the UMD wrapper.
 */
export type DiffKind = 'N' | 'E' | 'A' | 'D';

export interface Diff {
  readonly kind: DiffKind;
  readonly path?: (string | number)[];
  readonly index?: number;
  readonly item?: Diff;
  readonly lhs?: unknown;
  readonly rhs?: unknown;
}

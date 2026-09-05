export type PathSegment = string | number;
export type DiffKind = 'N' | 'E' | 'A' | 'D';

interface Change<Kind extends DiffKind> {
  readonly kind: Kind;
  readonly path?: PathSegment[];
}

function withPath<Kind extends DiffKind> (
  change: Change<Kind>,
  path?: readonly PathSegment[],
): void {
  if (path?.length) {
    Object.defineProperty(change, 'path', {
      value: [...path],
      enumerable: true,
    });
  }
}

export class DiffEdit<Lhs = unknown, Rhs = unknown> implements Change<'E'> {
  readonly kind = 'E' as const;
  readonly path?: PathSegment[];
  readonly lhs: Lhs;
  readonly rhs: Rhs;

  constructor (path: readonly PathSegment[] | undefined, lhs: Lhs, rhs: Rhs) {
    withPath(this, path);
    this.lhs = lhs;
    this.rhs = rhs;
  }
}

export class DiffNew<Rhs = unknown> implements Change<'N'> {
  readonly kind = 'N' as const;
  readonly path?: PathSegment[];
  readonly rhs: Rhs;

  constructor (path: readonly PathSegment[] | undefined, rhs: Rhs) {
    withPath(this, path);
    this.rhs = rhs;
  }
}

export class DiffDeleted<Lhs = unknown> implements Change<'D'> {
  readonly kind = 'D' as const;
  readonly path?: PathSegment[];
  readonly lhs: Lhs;

  constructor (path: readonly PathSegment[] | undefined, lhs: Lhs) {
    withPath(this, path);
    this.lhs = lhs;
  }
}

export class DiffArray implements Change<'A'> {
  readonly kind = 'A' as const;
  readonly path?: PathSegment[];

  constructor (
    path: readonly PathSegment[] | undefined,
    readonly index: number,
    readonly item: Diff,
  ) {
    withPath(this, path);
  }
}

export type Diff = DiffEdit | DiffNew | DiffDeleted | DiffArray;

export const validKinds: readonly DiffKind[] = ['N', 'E', 'A', 'D'];

export const validKinds = ['N', 'E', 'A', 'D'];

function inherits (ctor: any, superCtor: any) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true,
    },
  });
}

function Diff (kind: string, path: any) {
  Object.defineProperty(this, 'kind', {
    value: kind,
    enumerable: true,
  });
  if (path && path.length) {
    Object.defineProperty(this, 'path', {
      value: path,
      enumerable: true,
    });
  }
}

export function DiffEdit (path: any, origin: any, value: any) {
  (DiffEdit as any).super_.call(this, 'E', path);
  Object.defineProperty(this, 'lhs', {
    value: origin,
    enumerable: true,
  });
  Object.defineProperty(this, 'rhs', {
    value: value,
    enumerable: true,
  });
}
inherits(DiffEdit, Diff);

export function DiffNew (path: any, value: any) {
  (DiffNew as any).super_.call(this, 'N', path);
  Object.defineProperty(this, 'rhs', {
    value: value,
    enumerable: true,
  });
}
inherits(DiffNew, Diff);

export function DiffDeleted (path: any, value: any) {
  (DiffDeleted as any).super_.call(this, 'D', path);
  Object.defineProperty(this, 'lhs', {
    value: value,
    enumerable: true,
  });
}
inherits(DiffDeleted, Diff);

export function DiffArray (path: any, index: any, item: any) {
  (DiffArray as any).super_.call(this, 'A', path);
  Object.defineProperty(this, 'index', {
    value: index,
    enumerable: true,
  });
  Object.defineProperty(this, 'item', {
    value: item,
    enumerable: true,
  });
}
inherits(DiffArray, Diff);

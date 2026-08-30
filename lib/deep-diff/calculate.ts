import { DiffArray, DiffDeleted, DiffEdit, DiffNew } from './changes';
import { getOrderIndependentHash } from './hash';
import { realTypeOf } from './utils';

/** Recursively records structural differences between two values. */
export function deepDiff (
  lhs: any,
  rhs: any,
  changes: any,
  prefilter: any,
  path?: any,
  key?: any,
  stack?: any,
  orderIndependent?: any,
) {
  changes = changes || [];
  path = path || [];
  stack = stack || [];
  var currentPath = path.slice(0);
  if (typeof key !== 'undefined' && key !== null) {
    if (prefilter) {
      if (typeof (prefilter) === 'function' && prefilter(currentPath, key)) {
        return;
      } else if (typeof (prefilter) === 'object') {
        if (prefilter.prefilter && prefilter.prefilter(currentPath, key)) {
          return;
        }
        if (prefilter.normalize) {
          var alt = prefilter.normalize(currentPath, key, lhs, rhs);
          if (alt) {
            lhs = alt[0];
            rhs = alt[1];
          }
        }
      }
    }
    currentPath.push(key);
  }

  if (realTypeOf(lhs) === 'regexp' && realTypeOf(rhs) === 'regexp') {
    lhs = lhs.toString();
    rhs = rhs.toString();
  }

  var ltype = typeof lhs;
  var rtype = typeof rhs;
  var i, j, k, other;

  var ldefined = ltype !== 'undefined' ||
    (stack && (stack.length > 0) && stack[stack.length - 1].lhs &&
      Object.getOwnPropertyDescriptor(stack[stack.length - 1].lhs, key));
  var rdefined = rtype !== 'undefined' ||
    (stack && (stack.length > 0) && stack[stack.length - 1].rhs &&
      Object.getOwnPropertyDescriptor(stack[stack.length - 1].rhs, key));

  if (!ldefined && rdefined) {
    changes.push(new DiffNew(currentPath, rhs));
  } else if (!rdefined && ldefined) {
    changes.push(new DiffDeleted(currentPath, lhs));
  } else if (realTypeOf(lhs) !== realTypeOf(rhs)) {
    changes.push(new DiffEdit(currentPath, lhs, rhs));
  } else if (realTypeOf(lhs) === 'date' && (lhs - rhs) !== 0) {
    changes.push(new DiffEdit(currentPath, lhs, rhs));
  } else if (ltype === 'object' && lhs !== null && rhs !== null) {
    for (i = stack.length - 1; i > -1; --i) {
      if (stack[i].lhs === lhs) {
        other = true;
        break;
      }
    }
    if (!other) {
      stack.push({ lhs: lhs, rhs: rhs });
      if (Array.isArray(lhs)) {
        if (orderIndependent) {
          lhs.sort(function (a, b) {
            return getOrderIndependentHash(a) - getOrderIndependentHash(b);
          });

          rhs.sort(function (a, b) {
            return getOrderIndependentHash(a) - getOrderIndependentHash(b);
          });
        }
        i = rhs.length - 1;
        j = lhs.length - 1;
        while (i > j) {
          changes.push(new DiffArray(currentPath, i, new DiffNew(undefined, rhs[i--])));
        }
        while (j > i) {
          changes.push(new DiffArray(currentPath, j, new DiffDeleted(undefined, lhs[j--])));
        }
        for (; i >= 0; --i) {
          deepDiff(lhs[i], rhs[i], changes, prefilter, currentPath, i, stack, orderIndependent);
        }
      } else {
        var akeys = Object.keys(lhs);
        var pkeys = Object.keys(rhs);
        for (i = 0; i < akeys.length; ++i) {
          k = akeys[i];
          other = pkeys.indexOf(k);
          if (other >= 0) {
            deepDiff(lhs[k], rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
            pkeys[other] = null;
          } else {
            deepDiff(lhs[k], undefined, changes, prefilter, currentPath, k, stack, orderIndependent);
          }
        }
        for (i = 0; i < pkeys.length; ++i) {
          k = pkeys[i];
          if (k) {
            deepDiff(undefined, rhs[k], changes, prefilter, currentPath, k, stack, orderIndependent);
          }
        }
      }
      stack.length = stack.length - 1;
    } else if (lhs !== rhs) {
      changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
  } else if (lhs !== rhs) {
    if (!(ltype === 'number' && isNaN(lhs) && isNaN(rhs))) {
      changes.push(new DiffEdit(currentPath, lhs, rhs));
    }
  }
}

export function observableDiff (
  lhs: any,
  rhs: any,
  observer: any,
  prefilter: any,
  orderIndependent?: any,
) {
  var changes = [];
  deepDiff(lhs, rhs, changes, prefilter, null, null, null, orderIndependent);
  if (observer) {
    for (var i = 0; i < changes.length; ++i) {
      observer(changes[i]);
    }
  }
  return changes;
}

export function orderIndependentDeepDiff (
  lhs: any,
  rhs: any,
  changes: any,
  prefilter: any,
  path: any,
  key: any,
  stack: any,
) {
  return deepDiff(lhs, rhs, changes, prefilter, path, key, stack, true);
}

export function accumulateDiff (lhs: any, rhs: any, prefilter: any, accum: any) {
  var observer = (accum)
    ? function (difference) {
      if (difference) {
        accum.push(difference);
      }
    }
    : undefined;
  var changes = observableDiff(lhs, rhs, observer, prefilter);
  return (accum) ? accum : (changes.length) ? changes : undefined;
}

export function accumulateOrderIndependentDiff (
  lhs: any,
  rhs: any,
  prefilter: any,
  accum: any,
) {
  var observer = (accum)
    ? function (difference) {
      if (difference) {
        accum.push(difference);
      }
    }
    : undefined;
  var changes = observableDiff(lhs, rhs, observer, prefilter, true);
  return (accum) ? accum : (changes.length) ? changes : undefined;
}

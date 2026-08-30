import { validKinds } from './changes';
import { observableDiff } from './calculate';
import { arrayRemove } from './utils';

function applyArrayChange (arr: any, index: any, change?: any) {
  if (change.path && change.path.length) {
    var it = arr[index];
    var i;
    var u = change.path.length - 1;
    for (i = 0; i < u; i++) {
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case 'A':
        applyArrayChange(it[change.path[i]], change.index, change.item);
        break;
      case 'D':
        delete it[change.path[i]];
        break;
      case 'E':
      case 'N':
        it[change.path[i]] = change.rhs;
        break;
    }
  } else {
    switch (change.kind) {
      case 'A':
        applyArrayChange(arr[index], change.index, change.item);
        break;
      case 'D':
        arr = arrayRemove(arr, index);
        break;
      case 'E':
      case 'N':
        arr[index] = change.rhs;
        break;
    }
  }
  return arr;
}

export function applyChange (target: any, source?: any, change?: any) {
  if (typeof change === 'undefined' && source && ~validKinds.indexOf(source.kind)) {
    change = source;
  }
  if (target && change && change.kind) {
    var it = target;
    var i = -1;
    var last = change.path ? change.path.length - 1 : 0;
    while (++i < last) {
      if (typeof it[change.path[i]] === 'undefined') {
        it[change.path[i]] = (typeof change.path[i + 1] !== 'undefined' && typeof change.path[i + 1] === 'number') ? [] : {};
      }
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case 'A':
        if (change.path && typeof it[change.path[i]] === 'undefined') {
          it[change.path[i]] = [];
        }
        applyArrayChange(change.path ? it[change.path[i]] : it, change.index, change.item);
        break;
      case 'D':
        delete it[change.path[i]];
        break;
      case 'E':
      case 'N':
        it[change.path[i]] = change.rhs;
        break;
    }
  }
}

function revertArrayChange (arr: any, index: any, change?: any) {
  if (change.path && change.path.length) {
    var it = arr[index];
    var i;
    var u = change.path.length - 1;
    for (i = 0; i < u; i++) {
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case 'A':
        revertArrayChange(it[change.path[i]], change.index, change.item);
        break;
      case 'D':
      case 'E':
        it[change.path[i]] = change.lhs;
        break;
      case 'N':
        delete it[change.path[i]];
        break;
    }
  } else {
    switch (change.kind) {
      case 'A':
        revertArrayChange(arr[index], change.index, change.item);
        break;
      case 'D':
      case 'E':
        arr[index] = change.lhs;
        break;
      case 'N':
        arr = arrayRemove(arr, index);
        break;
    }
  }
  return arr;
}

export function revertChange (target: any, source?: any, change?: any) {
  if (target && source && change && change.kind) {
    var it = target;
    var i;
    var u = change.path.length - 1;
    for (i = 0; i < u; i++) {
      if (typeof it[change.path[i]] === 'undefined') {
        it[change.path[i]] = {};
      }
      it = it[change.path[i]];
    }
    switch (change.kind) {
      case 'A':
        revertArrayChange(it[change.path[i]], change.index, change.item);
        break;
      case 'D':
      case 'E':
        it[change.path[i]] = change.lhs;
        break;
      case 'N':
        delete it[change.path[i]];
        break;
    }
  }
}

export function applyDiff (target: any, source: any, filter: any) {
  if (target && source) {
    var onChange = function (change) {
      if (!filter || filter(target, source, change)) {
        applyChange(target, source, change);
      }
    };
    observableDiff(target, source, onChange, undefined);
  }
}

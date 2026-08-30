import { applyChange, applyDiff, revertChange } from './apply';
import {
  accumulateDiff,
  accumulateOrderIndependentDiff,
  observableDiff,
  orderIndependentDeepDiff,
} from './calculate';
import { getOrderIndependentHash } from './hash';

Object.defineProperties(accumulateDiff, {
  diff: {
    value: accumulateDiff,
    enumerable: true,
  },
  orderIndependentDiff: {
    value: accumulateOrderIndependentDiff,
    enumerable: true,
  },
  observableDiff: {
    value: observableDiff,
    enumerable: true,
  },
  orderIndependentObservableDiff: {
    value: orderIndependentDeepDiff,
    enumerable: true,
  },
  orderIndepHash: {
    value: getOrderIndependentHash,
    enumerable: true,
  },
  applyDiff: {
    value: applyDiff,
    enumerable: true,
  },
  applyChange: {
    value: applyChange,
    enumerable: true,
  },
  revertChange: {
    value: revertChange,
    enumerable: true,
  },
  isConflict: {
    value: function () {
      return typeof (globalThis as any).$conflict !== 'undefined';
    },
    enumerable: true,
  },
});

(accumulateDiff as any).DeepDiff = accumulateDiff;

export default accumulateDiff as any;

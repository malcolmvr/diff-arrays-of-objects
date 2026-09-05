import { applyChange, applyDiff, revertChange } from './apply';
import {
  accumulateDiff,
  accumulateOrderIndependentDiff,
  observableDiff,
  orderIndependentDeepDiff,
  PreFilter,
} from './calculate';
import { Diff } from './changes';
import { getOrderIndependentHash } from './hash';

export interface DeepDiffApi {
  (
    lhs: unknown,
    rhs: unknown,
    prefilter?: PreFilter,
    accumulator?: Diff[],
  ): Diff[] | undefined;
  readonly diff: typeof accumulateDiff;
  readonly orderIndependentDiff: typeof accumulateOrderIndependentDiff;
  readonly observableDiff: typeof observableDiff;
  readonly orderIndependentObservableDiff: typeof orderIndependentDeepDiff;
  readonly orderIndepHash: typeof getOrderIndependentHash;
  readonly applyDiff: typeof applyDiff;
  readonly applyChange: typeof applyChange;
  readonly revertChange: typeof revertChange;
  readonly isConflict: () => boolean;
  readonly DeepDiff: DeepDiffApi;
}

const deepDiff = accumulateDiff as unknown as DeepDiffApi;

Object.defineProperties(deepDiff, {
  diff: { value: accumulateDiff, enumerable: true },
  orderIndependentDiff: {
    value: accumulateOrderIndependentDiff,
    enumerable: true,
  },
  observableDiff: { value: observableDiff, enumerable: true },
  orderIndependentObservableDiff: {
    value: orderIndependentDeepDiff,
    enumerable: true,
  },
  orderIndepHash: { value: getOrderIndependentHash, enumerable: true },
  applyDiff: { value: applyDiff, enumerable: true },
  applyChange: { value: applyChange, enumerable: true },
  revertChange: { value: revertChange, enumerable: true },
  isConflict: {
    value: () => '$conflict' in globalThis,
    enumerable: true,
  },
  DeepDiff: { value: deepDiff, enumerable: true },
});

export default deepDiff;

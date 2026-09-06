import { bench, describe } from 'vitest';
import diff from '../dist/index.js';
import deep from '../dist/deep-diff/index.js';
import { changeMixedObject, mixedObject, nestedArrays } from './fixtures/mixed-values.js';

const options = { time: 500, iterations: 10, warmupTime: 100, warmupIterations: 2 };

for (const size of [100, 1000]) {
  describe(`mixed object with ${size} entries`, () => {
    const before = mixedObject(size);
    const equal = mixedObject(size);
    const sparse = mixedObject(size);
    const dense = mixedObject(size);
    changeMixedObject(sparse, 100);
    changeMixedObject(dense);

    bench('default comparison, equal', () => {
      diff([before], [equal]);
    }, options);
    bench('detailed comparison, sparse changes (1%)', () => {
      diff([before], [sparse], 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    }, options);
    bench('detailed comparison, dense changes (100%)', () => {
      diff([before], [dense], 'id', { updatedValues: diff.updatedValues.bothWithDeepDiff });
    }, options);
    bench('deep walker, equal', () => {
      deep(before, equal);
    }, options);
    bench('classify array of equal mixed records', () => {
      diff(before.entries, equal.entries);
    }, options);

    let left = mixedObject(size);
    let right = mixedObject(size);
    bench('order-independent comparison, reversed entries', () => {
      deep.orderIndependentDiff(left, right);
    }, {
      ...options,
      setup (task) {
        // Sorting mutates inputs. Tinybench runs this hook outside each timing
        // sample so every iteration receives fresh, unsorted inputs.
        task.opts.beforeEach = () => {
          left = mixedObject(size);
          right = mixedObject(size);
          right.entries.reverse();
        };
      },
    });
  });
}

describe('nested singleton arrays: depth scaling', () => {
  for (const depth of [5, 10, 15, 18]) {
    const before = nestedArrays(depth);
    const after = nestedArrays(depth);
    bench(`order-independent, depth ${depth}`, () => {
      deep.orderIndependentDiff(before, after);
    }, { ...options, iterations: 3, warmupIterations: 1 });
  }
});

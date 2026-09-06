import diff, { UpdatedValues, type DeepDiffChange } from '@wvanderp/diff-arrays-of-objects';

// Compile through the package's actual conditional exports in NodeNext mode.
interface Item { id: number; name: string }
const before: readonly Item[] = [{ id: 1, name: 'before' }];
const after: readonly Item[] = [{ id: 1, name: 'after' }];
const ordinary: Item[] = diff(before, after).updated;
const both: [Item, Item][] = diff(before, after, 'id', {
  updatedValues: UpdatedValues.both,
}).updated;
const detailed: [Item, Item, DeepDiffChange[]][] = diff(before, after, 'id', {
  updatedValues: UpdatedValues.bothWithDeepDiff,
}).updated;
// @ts-expect-error The identity field must be a key of Item.
diff(before, after, 'missing');
void [ordinary, both, detailed];

// Explicit mode parameters must have a matching runtime option.
// @ts-expect-error Selecting tuple output requires the options argument.
diff<Item, UpdatedValues.both>(before, after);
// @ts-expect-error Empty options still use the default mode at runtime.
diff<Item, UpdatedValues.both>(before, after, 'id', {});
// @ts-expect-error Detailed output also requires an explicit runtime mode.
diff<Item, UpdatedValues.bothWithDeepDiff>(before, after, 'id', {});
// @ts-expect-error The runtime mode must match the explicit generic mode.
diff<Item, UpdatedValues.both>(before, after, 'id', { updatedValues: UpdatedValues.second });
const explicitBoth: [Item, Item][] = diff<Item, UpdatedValues.both>(before, after, 'id', {
  updatedValues: UpdatedValues.both,
}).updated;
void explicitBoth;

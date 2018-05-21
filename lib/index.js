const difference = require('lodash/fp/difference');
const groupBy = require('lodash/fp/groupBy');
const isArray = require('lodash/fp/isArray');
const isEqual = require('lodash/fp/isEqual');
const isFunction = require('lodash/fp/isFunction');
const isString = require('lodash/fp/isString');
const keyBy = require('lodash/fp/keyBy');
const map = require('lodash/fp/map');

const updatedValues = {
  first: 1,
  second: 2,
  both: 3,
};

const diff = (first = [], second = [], idField = 'id', options = {}) => {

  // set defaults for "options"
  const opts = {
    compareFunction: isEqual, // set default compareFunction to lodash isEqual
    updatedValues: updatedValues.second,
    ...options,
  };

  // parameter validation
  if (!isArray(first)) throw new Error('diff-arrays-of-objects error: "first" parameter must be an array but is not');
  if (!isArray(second)) throw new Error('diff-arrays-of-objects error: "second" parameter must be an array but is not');
  if (!isString(idField)) throw new Error('diff-arrays-of-objects error: "idField" parameter must be a string but is not');
  if (!isFunction(opts.compareFunction)) throw new Error('diff-arrays-of-objects error: "options.compareFunction" must be a function but is not');

  // index the first array by its id values.
  // if first is [{ id: 1, a: 1 }, { id: 2, a: 3 }] then
  // firstIndex will be { 1: { id: 1, a: 1 }, 2: { id: 2, a: 3 } }
  // "getKey" has a side-effect of pushing the id value into firstIds
  const firstIds = [];
  const getKey = (o) => {
    firstIds.push(o[idField]);
    return o[idField];
  };
  const firstIndex = keyBy(getKey)(first);

  // arrays to hold the id values in the two arrays
  const secondIds = [];

  // "grouped" is the function used in the groupBy in the next step.
  // It has a side-effect of pushing the idField value of second object (o2)
  // into the secondIds array. The side-effect easily be avoided but saves
  // another iteration of the "second" array.
  const groupingFunction = (o2) => {
    secondIds.push(o2[idField]); // ! side-effect
    const o1 = firstIndex[o2[idField]]; // take advantage of the closure
    if (!o1) return 'added';
    else if (opts.compareFunction(o1, o2)) return 'same';
    else return 'updated';
  };

  // this creates the "added", "same" and "updated" results
  const result = groupBy(groupingFunction)(second);

  if (opts.updatedValues === updatedValues.first) {
    result.updated = map(u => firstIndex[u[idField]])(result.updated);
  } else if (opts.updatedValues === updatedValues.both) {
    result.updated = map(u => [firstIndex[u[idField]], u])(result.updated);
  }

  // now add "removed" and return
  const removedIds = difference(firstIds)(secondIds);
  const removed = map(id => firstIndex[id])(removedIds);
  return { same: [], added: [], updated: [], ...result, removed };
};

diff.updatedValues = updatedValues;

module.exports = diff;

const first = [{ id: 1, letter: 'a', ignored: 'x' }];
const second = [{ id: 1, letter: 'a', ignored: 'y' }];
const compareFunction = (o1, o2) => {
  return o1.letter === o2.letter;
};
diff(first, second, 'id', { compareFunction });

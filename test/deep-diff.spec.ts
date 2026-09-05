import deepDiff from '../lib/deep-diff';
import { describe, expect, it } from 'vitest';


let deep = deepDiff;

  describe('deep-diff', function () {
    const empty = {};

    describe('A target that has no properties', function () {

      it('shows no differences when compared to another empty object', function () {
        expect(deep.diff(empty, {})).toBeUndefined();
      });

      describe('when compared to a different type of keyless object', function () {
        const comparandTuples = [
          ['an array', {
            key: [],
          }],
          ['an object', {
            key: {},
          }],
          ['a date', {
            key: new Date(),
          }],
          ['a null', {
            key: null,
          }],
          ['a regexp literal', {
            key: /a/,
          }],
          ['Math', {
            key: Math,
          }],
        ];

        comparandTuples.forEach(function (lhsTuple) {
          comparandTuples.forEach(function (rhsTuple) {
            if (lhsTuple[0] === rhsTuple[0]) {
              return;
            }
            it('shows differences when comparing ' + lhsTuple[0] + ' to ' + rhsTuple[0], function () {
              const diff = deep.diff(lhsTuple[1], rhsTuple[1]);
              expect(diff).toBeTruthy();
              expect(diff.length).toBe(1);
              expect(diff[0]).toHaveProperty('kind');
              expect(diff[0].kind).toBe('E');
            });
          });
        });
      });

      describe('when compared with an object having other properties', function () {
        const comparand = {
          other: 'property',
          another: 13.13,
        };
        const diff = deep.diff(empty, comparand);

        it('the differences are reported', function () {
          expect(diff).toBeTruthy();
          expect(diff.length).toBe(2);

          expect(diff[0]).toHaveProperty('kind');
          expect(diff[0].kind).toBe('N');
          expect(diff[0]).toHaveProperty('path');
          expect(diff[0].path).toBeInstanceOf(Array);
          expect(diff[0].path[0]).toEqual('other');
          expect(diff[0]).toHaveProperty('rhs');
          expect(diff[0].rhs).toBe('property');

          expect(diff[1]).toHaveProperty('kind');
          expect(diff[1].kind).toBe('N');
          expect(diff[1]).toHaveProperty('path');
          expect(diff[1].path).toBeInstanceOf(Array);
          expect(diff[1].path[0]).toEqual('another');
          expect(diff[1]).toHaveProperty('rhs');
          expect(diff[1].rhs).toBe(13.13);
        });

      });

    });

    describe('A target that has one property', function () {
      const lhs = {
        one: 'property',
      };

      it('shows no differences when compared to itself', function () {
        expect(deep.diff(lhs, lhs)).toBeUndefined();
      });

      it('shows the property as removed when compared to an empty object', function () {
        const diff = deep.diff(lhs, empty);
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('D');
      });

      it('shows the property as edited when compared to an object with null', function () {
        const diff = deep.diff(lhs, {
          one: null,
        });
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('E');
      });

      it('shows the property as edited when compared to an array', function () {
        const diff = deep.diff(lhs, ['one']);
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('E');
      });

    });

    describe('A target that has null value', function () {
      const lhs = {
        key: null,
      };

      it('shows no differences when compared to itself', function () {
        expect(deep.diff(lhs, lhs)).toBeUndefined();
      });

      it('shows the property as removed when compared to an empty object', function () {
        const diff = deep.diff(lhs, empty);
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('D');
      });

      it('shows the property is changed when compared to an object that has value', function () {
        const diff = deep.diff(lhs, {
          key: 'value',
        });
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('E');
      });

      it('shows that an object property is changed when it is set to null', function () {
        lhs.key = {
          nested: 'value',
        };
        const diff = deep.diff(lhs, {
          key: null,
        });
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('E');
      });

    });


    describe('A target that has a date value', function () {
      const lhs = {
        key: new Date(555555555555),
      };

      it('shows the property is changed with a new date value', function () {
        const diff = deep.diff(lhs, {
          key: new Date(777777777777),
        });
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('E');
      });

    });


    describe('A target that has a NaN', function () {
      const lhs = {
        key: NaN,
      };

      it('shows the property is changed when compared to another number', function () {
        const diff = deep.diff(lhs, {
          key: 0,
        });
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(1);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('E');
      });

      it('shows no differences when compared to another NaN', function () {
        const diff = deep.diff(lhs, {
          key: NaN,
        });
        expect(diff).toBeUndefined();
      });

    });


    describe('can revert namespace using noConflict', function () {
      if (!deep.noConflict) {
        it.skip('is unavailable in the vendored module build', function () {});
        return;
      }

      deep = deep.noConflict();

      it('conflict is restored (when applicable)', function () {
        // In node there is no global conflict.
        if (typeof globalConflict !== 'undefined') {
          expect(DeepDiff).toBe(deep); // eslint-disable-line no-undef
        }
      });

      it('DeepDiff functionality available through result of noConflict()', function () {
        expect(deep.applyDiff).toBeTypeOf('function');
      });
    });


    describe('When filtering keys', function () {
      const lhs = {
        enhancement: 'Filter/Ignore Keys?',
        numero: 11,
        submittedBy: 'ericclemmons',
        supportedBy: ['ericclemmons'],
        status: 'open',
      };
      const rhs = {
        enhancement: 'Filter/Ignore Keys?',
        numero: 11,
        submittedBy: 'ericclemmons',
        supportedBy: [
          'ericclemmons',
          'TylerGarlick',
          'flitbit',
          'ergdev',
        ],
        status: 'closed',
        fixedBy: 'flitbit',
      };

      describe('if the filtered property is an array', function () {

        it('changes to the array do not appear as a difference', function () {
          const prefilter = function (path, key) {
            return key === 'supportedBy';
          };
          const diff = deep(lhs, rhs, prefilter);
          expect(diff).toBeTruthy();
          expect(diff.length).toBe(2);
          expect(diff[0]).toHaveProperty('kind');
          expect(diff[0].kind).toBe('E');
          expect(diff[1]).toHaveProperty('kind');
          expect(diff[1].kind).toBe('N');
        });

      });

      describe('if the filtered property is not an array', function () {

        it('changes do not appear as a difference', function () {
          const prefilter = function (path, key) {
            return key === 'fixedBy';
          };
          const diff = deep(lhs, rhs, prefilter);
          expect(diff).toBeTruthy();
          expect(diff.length).toBe(4);
          expect(diff[0]).toHaveProperty('kind');
          expect(diff[0].kind).toBe('A');
          expect(diff[1]).toHaveProperty('kind');
          expect(diff[1].kind).toBe('A');
          expect(diff[2]).toHaveProperty('kind');
          expect(diff[2].kind).toBe('A');
          expect(diff[3]).toHaveProperty('kind');
          expect(diff[3].kind).toBe('E');
        });

      });
    });

    describe('A target that has nested values', function () {
      const nestedOne = {
        noChange: 'same',
        levelOne: {
          levelTwo: 'value',
        },
        arrayOne: [{
          objValue: 'value',
        }],
      };
      const nestedTwo = {
        noChange: 'same',
        levelOne: {
          levelTwo: 'another value',
        },
        arrayOne: [{
          objValue: 'new value',
        }, {
          objValue: 'more value',
        }],
      };

      it('shows no differences when compared to itself', function () {
        expect(deep.diff(nestedOne, nestedOne)).toBeUndefined();
      });

      it('shows the property as removed when compared to an empty object', function () {
        const diff = deep(nestedOne, empty);
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(3);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('D');
        expect(diff[1]).toHaveProperty('kind');
        expect(diff[1].kind).toBe('D');
      });

      it('shows the property is changed when compared to an object that has value', function () {
        const diff = deep.diff(nestedOne, nestedTwo);
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(3);
      });

      it('shows the property as added when compared to an empty object on left', function () {
        const diff = deep.diff(empty, nestedOne);
        expect(diff).toBeTruthy();
        expect(diff.length).toBe(3);
        expect(diff[0]).toHaveProperty('kind');
        expect(diff[0].kind).toBe('N');
      });

      describe('when diff is applied to a different empty object', function () {
        const diff = deep.diff(nestedOne, nestedTwo);

        it('has result with nested values', function () {
          const result = {};

          deep.applyChange(result, nestedTwo, diff[0]);
          expect(result.levelOne).toBeTruthy();
          expect(result.levelOne).toBeTypeOf('object');
          expect(result.levelOne.levelTwo).toBeTruthy();
          expect(result.levelOne.levelTwo).toEqual('another value');
        });

        it('has result with array object values', function () {
          const result = {};

          deep.applyChange(result, nestedTwo, diff[2]);
          expect(result.arrayOne).toBeTruthy();
          expect(result.arrayOne).toBeInstanceOf(Array);
          expect(result.arrayOne[0]).toBeTruthy();
          expect(result.arrayOne[0].objValue).toBeTruthy();
          expect(result.arrayOne[0].objValue).toBe('new value');
        });

        it('has result with added array objects', function () {
          const result = {};

          deep.applyChange(result, nestedTwo, diff[1]);
          expect(result.arrayOne).toBeTruthy();
          expect(result.arrayOne).toBeInstanceOf(Array);
          expect(result.arrayOne[1]).toBeTruthy();
          expect(result.arrayOne[1].objValue).toBeTruthy();
          expect(result.arrayOne[1].objValue).toBe('more value');
        });
      });
    });

    describe('regression test for bug #10, ', function () {
      const lhs = {
        id: 'Release',
        phases: [{
          id: 'Phase1',
          tasks: [{
            id: 'Task1',
          }, {
            id: 'Task2',
          }],
        }, {
          id: 'Phase2',
          tasks: [{
            id: 'Task3',
          }],
        }],
      };
      const rhs = {
        id: 'Release',
        phases: [{
          // E: Phase1 -> Phase2
          id: 'Phase2',
          tasks: [{
            id: 'Task3',
          }],
        }, {
          id: 'Phase1',
          tasks: [{
            id: 'Task1',
          }, {
            id: 'Task2',
          }],
        }],
      };

      describe('differences in nested arrays are detected', function () {
        const diff = deep.diff(lhs, rhs);

        // there should be differences
        expect(diff).toBeDefined();
        expect(diff.length).toBe(6);

        it('differences can be applied', function () {
          deep.applyDiff(lhs, rhs);
          expect(lhs).toEqual(rhs);
        });
      });

    });

    describe('regression test for bug #35', function () {
      const lhs = ['a', 'a', 'a'];
      const rhs = ['a'];

      it('can apply diffs between two top level arrays', function () {
        const differences = deep.diff(lhs, rhs);

        differences.forEach(function (it) {
          deep.applyChange(lhs, true, it);
        });

        expect(lhs).toEqual(['a']);
      });
    });

    describe('Objects from different frames', function () {
      if (typeof globalConflict === 'undefined') {
        it.skip('requires a browser frame', function () {});
        return;
      }

      // eslint-disable-next-line no-undef
      const frame = document.createElement('iframe');
      // eslint-disable-next-line no-undef
      document.body.appendChild(frame);

      const lhs = new frame.contentWindow.Date(2010, 1, 1);
      const rhs = new frame.contentWindow.Date(2010, 1, 1);

      it('can compare date instances from a different frame', function () {
        const differences = deep.diff(lhs, rhs);

        expect(differences).toBeUndefined();
      });
    });

    describe('Comparing regexes should work', function () {
      const lhs = /foo/;
      const rhs = /foo/i;

      it('can compare regex instances', function () {
        const diff = deep.diff(lhs, rhs);

        expect(diff.length).toBe(1);

        expect(diff[0].kind).toBe('E');
        expect(diff[0].path).toBeFalsy();
        expect(diff[0].lhs).toBe('/foo/');
        expect(diff[0].rhs).toBe('/foo/i');
      });
    });

    describe('subject.toString is not a function', function () {
      const lhs = {
        left: 'yes',
        right: 'no',
      };
      const rhs = {
        left: {
          toString: true,
        },
        right: 'no',
      };

      it('should not throw a TypeError', function () {
        const diff = deep.diff(lhs, rhs);

        expect(diff.length).toBe(1);
      });
    });

    describe('regression test for issue #83', function () {
      const lhs = {
        date: null,
      };
      const rhs = {
        date: null,
      };

      it('should not detect a difference', function () {
        expect(deep.diff(lhs, rhs)).toBeUndefined();
      });
    });

    describe('regression test for issue #70', function () {

      it('should detect a difference with undefined property on lhs', function () {
        const diff = deep.diff({ foo: undefined }, {});

        expect(diff).toBeInstanceOf(Array);
        expect(diff.length).toBe(1);

        expect(diff[0].kind).toBe('D');
        expect(diff[0].path).toBeInstanceOf(Array);
        expect(diff[0].path).toHaveLength(1);
        expect(diff[0].path[0]).toBe('foo');
        expect(diff[0].lhs).toBeUndefined();

      });

      it('should detect a difference with undefined property on rhs', function () {
        const diff = deep.diff({}, { foo: undefined });

        expect(diff).toBeInstanceOf(Array);
        expect(diff.length).toBe(1);

        expect(diff[0].kind).toBe('N');
        expect(diff[0].path).toBeInstanceOf(Array);
        expect(diff[0].path).toHaveLength(1);
        expect(diff[0].path[0]).toBe('foo');
        expect(diff[0].rhs).toBeUndefined();

      });
    });

    describe('regression test for issue #98', function () {
      const lhs = { foo: undefined };
      const rhs = { foo: undefined };

      it('should not detect a difference with two undefined property values', function () {
        const diff = deep.diff(lhs, rhs);

        expect(diff).toBeUndefined();

      });
    });

    describe('regression tests for issue #102', function () {
      it('should not throw a TypeError', function () {

        const diff = deep.diff(null, undefined);

        expect(diff).toBeInstanceOf(Array);
        expect(diff.length).toBe(1);

        expect(diff[0].kind).toBe('D');
        expect(diff[0].lhs).toBeNull();

      });

      it('should not throw a TypeError', function () {

        const diff = deep.diff(Object.create(null), { foo: undefined });

        expect(diff).toBeInstanceOf(Array);
        expect(diff.length).toBe(1);

        expect(diff[0].kind).toBe('N');
        expect(diff[0].rhs).toBeUndefined();
      });
    });

    describe('Order independent hash testing', function () {
      function sameHash (a, b) {
        expect(deep.orderIndepHash(a)).toBe(deep.orderIndepHash(b));
      }

      function differentHash (a, b) {
        expect(deep.orderIndepHash(a)).not.toBe(deep.orderIndepHash(b));
      }

      describe('Order indepdendent hash function should give different values for different objects', function () {
        it('should give different values for different "simple" types', function () {
          differentHash(1, -20);
          differentHash('foo', 45);
          differentHash('pie', 'something else');
          differentHash(1.3332, 1);
          differentHash(1, null);
          differentHash('this is kind of a long string, don\'t you think?', 'the quick brown fox jumped over the lazy doge');
          differentHash(true, 2);
          differentHash(false, 'flooog');
        });

        it('should give different values for string and object with string', function () {
          differentHash('some string', { key: 'some string' });
        });

        it('should give different values for number and array', function () {
          differentHash(1, [1]);
        });

        it('should give different values for string and array of string', function () {
          differentHash('string', ['string']);
        });

        it('should give different values for boolean and object with boolean', function () {
          differentHash(true, { key: true });
        });

        it('should give different values for different arrays', function () {
          differentHash([1, 2, 3], [1, 2]);
          differentHash([1, 4, 5, 6], ['foo', 1, true, undefined]);
          differentHash([1, 4, 6], [1, 4, 7]);
          differentHash([1, 3, 5], ['1', '3', '5']);
        });

        it('should give different values for different objects', function () {
          differentHash({ key: 'value' }, { other: 'value' });
          differentHash({ a: { b: 'c' } }, { a: 'b' });
        });

        it('should differentiate between arrays and objects', function () {
          differentHash([1, true, '1'], { a: 1, b: true, c: '1' });
        });
      });

      describe('Order independent hash function should work in pathological cases', function () {
        it('should work in funky javascript cases', function () {
          differentHash(undefined, null);
          differentHash(0, undefined);
          differentHash(0, null);
          differentHash(0, false);
          differentHash(0, []);
          differentHash('', []);
          differentHash(3.22, '3.22');
          differentHash(true, 'true');
          differentHash(false, 0);
        });

        it('should work on empty array and object', function () {
          differentHash([], {});
        });

        it('should work on empty object and undefined', function () {
          differentHash({}, undefined);
        });

        it('should work on empty array and array with 0', function () {
          differentHash([], [0]);
        });
      });

      describe('Order independent hash function should be order independent', function () {
        it('should not care about array order', function () {
          sameHash([1, 2, 3], [3, 2, 1]);
          sameHash(['hi', true, 9.4], [true, 'hi', 9.4]);
        });

        it('should not care about key order in an object', function () {
          sameHash({ foo: 'bar', foz: 'baz' }, { foz: 'baz', foo: 'bar' });
        });

        it('should work with complicated objects', function () {
          const obj1 = {
            foo: 'bar',
            faz: [
              1,
              'pie',
              {
                food: 'yum',
              },
            ],
          };

          const obj2 = {
            faz: [
              'pie',
              {
                food: 'yum',
              },
              1,
            ],
            foo: 'bar',
          };

          sameHash(obj1, obj2);
        });
      });
    });


    describe('Order indepedent array comparison should work', function () {
      it('can compare simple arrays in an order independent fashion', function () {
        const lhs = [1, 2, 3];
        const rhs = [1, 3, 2];

        const diff = deep.orderIndependentDiff(lhs, rhs);
        expect(diff).toBeUndefined();
      });

      it('still works with repeated elements', function () {
        const lhs = [1, 1, 2];
        const rhs = [1, 2, 1];

        const diff = deep.orderIndependentDiff(lhs, rhs);
        expect(diff).toBeUndefined();
      });

      it('works on complex objects', function () {
        const obj1 = {
          foo: 'bar',
          faz: [
            1,
            'pie',
            {
              food: 'yum',
            },
          ],
        };

        const obj2 = {
          faz: [
            'pie',
            {
              food: 'yum',
            },
            1,
          ],
          foo: 'bar',
        };

        const diff = deep.orderIndependentDiff(obj1, obj2);
        expect(diff).toBeUndefined();
      });

      it('should report some difference in non-equal arrays', function () {
        const lhs = [1, 2, 3];
        const rhs = [2, 2, 3];

        const diff = deep.orderIndependentDiff(lhs, rhs);
        expect(diff.length).toBeTruthy();
      });


    });

  });

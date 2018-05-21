# diff-arrays-of-objects

> Compare two arrays of objects, finding added, removed, updated and identical objects.

## Install

```bash
$ npm install diff-arrays-of-objects --save
```
## Usage

```js
const diff = require('diff-arrays-of-objects');
var result = diff(
  [
    {id: 1, name: 'a'},
    {id: 2, name: 'b'},
    {id: 3, name: 'c'},
    {id: 4, name: 'd'},
    {id: 5, name: 'e'}
  ],
  [
    {id: 1, name: 'a'},
    {id: 2, name: 'z'},
    {id: 7, name: 'e'}
  ],
  'id'
);

console.log(result)
// {
//   added: [
//     { id: 7, name: 'e' }
//   ],
//   removed: [
//     { id: 3, name: 'c' },
//     { id: 4, name: 'd' },
//     { id: 5, name: 'e' }
//   ],
//   updated: [
//     { id: 2, name: 'z' }
//   ],
//   same: [
//     { id: 1, name: 'a' }
//   ]
// }
```

## API

### diff-arrays-of-objects (first, second, idField, [options])

#### first

*Required*<br>
Type: `array`

First array to be compared.

#### second

*Required*<br>
Type: `array`

Second array to be compared.

#### idField

*Required*<br>
Type: `array`

The id field that is used to compare the arrays. Defaults to 'id'.

#### options

Type: `object`

```js
{
  compareFunction: <Func> // defaults to lodash's isEqual; must accept two parameters (o1, o2)
  updatedValues: <Number> // controls what gets returned in the "updated" results array:
                          // diff.updatedValues.first (1): the value from the first array
                          // diff.updatedValues.second (2): the value from the second array (default)
                          // diff.updatedValues.both (3): both values, as an array [first, second]
}
```

Examples:

```js
const diff = require('diff-arrays-of-objects');
const first = [{ id: 1, letter: 'a' }];
const second = [{ id: 1, letter: 'b' }];

const result = diff (first, second, idField, { updatedValues: diff.updatedValues.first });
// result.updated is [{ id: 1, letter: 'a' }]

const result = diff (first, second, idField, { updatedValues: diff.updatedValues.second });
// result.updated is [{ id: 1, letter: 'b' }]

const result = diff (first, second, idField, { updatedValues: diff.updatedValues.both });
// result.updated is [{ id: 1, letter: 'a' }, { id: 1, letter: 'b' }]
```

## License

MIT
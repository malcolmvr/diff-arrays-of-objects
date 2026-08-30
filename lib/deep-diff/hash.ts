import { realTypeOf } from './utils';

// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
function hashThisString (string: any) {
  var hash = 0;
  if (string.length === 0) { return hash; }
  for (var i = 0; i < string.length; i++) {
    var char = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/** Gets an object hash independent of array and object key order. */
export function getOrderIndependentHash (object: any) {
  var accum = 0;
  var type = realTypeOf(object);

  if (type === 'array') {
    object.forEach(function (item) {
      accum += getOrderIndependentHash(item);
    });

    var arrayString = '[type: array, hash: ' + accum + ']';
    return accum + hashThisString(arrayString);
  }

  if (type === 'object') {
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        var keyValueString = '[ type: object, key: ' + key + ', value hash: ' + getOrderIndependentHash(object[key]) + ']';
        accum += hashThisString(keyValueString);
      }
    }
    return accum;
  }

  var stringToHash = '[ type: ' + type + ' ; value: ' + object + ']';
  return accum + hashThisString(stringToHash);
}

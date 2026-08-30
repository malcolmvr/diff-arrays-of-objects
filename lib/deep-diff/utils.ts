export function arrayRemove (arr: any, from: any, to?: any) {
  var rest = arr.slice((to || from) + 1 || arr.length);
  arr.length = from < 0 ? arr.length + from : from;
  arr.push.apply(arr, rest);
  return arr;
}

export function realTypeOf (subject: any) {
  var type = typeof subject;
  if (type !== 'object') {
    return type;
  }

  if (subject === Math) {
    return 'math';
  } else if (subject === null) {
    return 'null';
  } else if (Array.isArray(subject)) {
    return 'array';
  } else if (Object.prototype.toString.call(subject) === '[object Date]') {
    return 'date';
  } else if (typeof subject.toString === 'function' && /^\/.*\//.test(subject.toString())) {
    return 'regexp';
  }
  return 'object';
}

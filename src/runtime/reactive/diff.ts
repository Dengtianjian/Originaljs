export function compareMerge(source, target) {
  if (typeof source === "object" && typeof target === "object") {
    for (const key in target) {
      if (Object.prototype.hasOwnProperty.call(source, key) && Object.prototype.hasOwnProperty.call(target, key)) {
        if (typeof target[key] === "object" && typeof source[key] === "object") {
          compareMerge(source[key], target[key]);
        } else if (target[key] !== source[key]) {
          target[key] = source[key];
        }
      } else {
        delete target[key];
      }
    }
  } else if (target !== source) {
    target = source;
  }
}

export default {
  compareMerge
}
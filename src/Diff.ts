export function compareMerge(newValue: any, target: any): void {
  for (const key in target) {
    if (typeof target[key] === "object" && typeof newValue[key] === 'object') {
      compareMerge(target[key], newValue[key]);
    } else if (newValue[key] && newValue[key] !== target[key]) {
      target[key] = newValue[key];
    } else if (newValue[key] === undefined) {
      delete target[key];
    }
  }
  for (const key in newValue) {
    if (!target[key]) {
      target[key] = newValue[key];
    }
  }
}

export function compareObject(source: object, target: object): boolean {
  if (source === target) return true;
  if (typeof source !== "object" || typeof target !== "object") return false;
  for (const key in source) {
    if (!target[key]) return false;
    if (typeof target[key] === 'object' && typeof source[key] === 'object' && compareObject(source[key], target[key]) === false) return false;
    if (typeof target[key] === 'object' && typeof source[key] !== 'object') return false;
    if (typeof source[key] === 'object' && typeof target[key] !== 'object') return false;
    if (source[key] !== target[key]) return false;
  }
  for (const key in target) {
    if (!source[key]) return false;
    if (typeof target[key] === 'object' && typeof source[key] === 'object' && compareObject(source[key], target[key]) === false) return false;
  }
  return true;
}

export default {
  compareMerge,
  compareObject
}
import { TPropertys } from "./types/pluginType";

function deepCopy(obj) {
  if (typeof obj !== 'object') return;

  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}

function objectAssign(target: object, source: object): object {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetItem = target[key];
      const sourceItem = source[key];
      if (typeof targetItem === "object") {
        if (Array.isArray(targetItem)) {
          target[key] = target[key].concat(sourceItem);
        } else {
          target[key] = objectAssign(targetItem, sourceItem);
        }
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

function generateObjectTree(branchs: string[], lastBranch: {} = {}): object {
  let tree = {};

  if (branchs.length === 1) {
    tree[branchs[0]] = lastBranch;
  } else {
    tree[branchs[0]] = generateObjectTree(branchs.slice(1), lastBranch);
  }
  return tree;
}

function deepGetObjectProperty(obj: object, propertyNames: string[]): TPropertys {
  if (obj[propertyNames[0]]) {
    return deepGetObjectProperty(obj[propertyNames[0]], propertyNames.slice(1));
  } else {
    return obj;
  }
}

export default {
  deepCopy,
  objectAssign,
  generateObjectTree,
  deepGetObjectProperty
}
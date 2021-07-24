import { IProperties } from "./types/Properties";

function deepCopy(obj): object {
  if (typeof obj !== 'object') return;

  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}

function objectAssign(target: object, source: object) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const targetItem = target[key];
      const sourceItem = source[key];
      if (typeof targetItem === "object") {
        if (Array.isArray(targetItem)) {
          target[key] = target[key].concat(sourceItem);
        } else {
          objectAssign(targetItem, sourceItem);
        }
      } else {
        target[key] = source[key];
      }
    }
  }
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

function deepGetObjectProperty(obj: object, propertyNames: string[]): IProperties {
  if (obj[propertyNames[0]]) {
    return deepGetObjectProperty(obj[propertyNames[0]], propertyNames.slice(1));
  } else {
    return obj;
  }
}

function defineProperty(obj, propertyKey: string, value: any, configurable: boolean = false, writable: boolean = false, enumerable: boolean = false): void {
  if (obj.hasOwnProperty(propertyKey)) {
    const target: {
      [x: string]: TypedPropertyDescriptor<any>;
    } & {
      [x: string]: PropertyDescriptor;
    } = Object.getOwnPropertyDescriptors(obj);
    if (target[propertyKey].writable === true) {
      obj[propertyKey] = value;
    }
    return;
  }
  Object.defineProperty(obj, propertyKey, {
    value,
    configurable,
    writable,
    enumerable
  })
}

export default {
  deepCopy,
  objectAssign,
  generateObjectTree,
  deepGetObjectProperty,
  defineProperty
}
import { transformPropertyName } from "./Parser";
import { IEl } from "./types/ElementType";
import { IProperties } from "./types/Properties";
import { TAttr, TText } from "./types/Ref";

export function deepCopy(obj): object {
  if (typeof obj !== 'object') return obj;

  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  return newObj;
}

export function objectAssign(target: object, source: object): void {
  for (const key in source) {
    if (!source.hasOwnProperty(key)) return;
    const targetItem = target[key];
    const sourceItem = source[key];

    if (typeof targetItem === "object") {
      if (Array.isArray(targetItem)) {
        targetItem.push(...sourceItem);
      } else {
        objectAssign(targetItem, sourceItem);
      }
    } else {
      target[key] = source[key];
    }
  }
}

export function generateObjectTree(branchs: string[], lastBranch: {} = {}): object {
  let tree = {};

  if (branchs.length === 1) {
    tree[branchs[0]] = lastBranch;
  } else {
    tree[branchs[0]] = generateObjectTree(branchs.slice(1), lastBranch);
  }
  return tree;
}

export function deepGetObjectProperty(obj: object, propertyNames: string[]): IProperties {
  if (obj[propertyNames[0]]) {
    return deepGetObjectProperty(obj[propertyNames[0]], propertyNames.slice(1));
  } else {
    return obj;
  }
}

export function deepSetObjectPropertyValue(obj: object, propertyNames: string[] | string, value: any): void {
  propertyNames = Array.isArray(propertyNames) ? propertyNames : transformPropertyName(propertyNames);

  if (propertyNames.length == 1) {
    obj[propertyNames[0]] = value;
  } else {
    let firstKey: string = propertyNames[0];
    propertyNames.shift();
    deepSetObjectPropertyValue(obj[firstKey], propertyNames, value);
  }
}

export function defineProperty(obj, propertyKey: string, value: any, configurable: boolean = false, writable: boolean = false, enumerable: boolean = false): void {
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

export function defineOGProperty(target: HTMLElement | TAttr | TText | Element | IEl, initProperties = {}): void {
  if (target.hasOwnProperty("__og__")) {
    objectAssign(target.__og__, initProperties);
    return;
  };
  defineProperty(target, "__og__", initProperties, false, false, false);
}

export default {
  deepCopy,
  objectAssign,
  generateObjectTree,
  deepGetObjectProperty,
  deepSetObjectPropertyValue,
  defineProperty,
  defineOGProperty
}
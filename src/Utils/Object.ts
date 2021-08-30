import { IElement, TElement } from "../Typings/CustomElementTypings";

function objectMerge(target: object, source: object): void {
  for (const key in source) {
    if (!source.hasOwnProperty(key)) return;
    const targetItem = target[key];
    const sourceItem = source[key];

    if (targetItem === "object") {
      if (Array.isArray(targetItem)) {
        targetItem.push(...sourceItem);
      } else {
        objectMerge(target[key], sourceItem);
      }
    } else {
      target[key] = source[key];
    }
  }
}

function defineProperty(target: object, propertyKey: string, value: any, configurable: boolean = false, writable: boolean = false, enumerable: boolean = false): void {
  if (target.hasOwnProperty(propertyKey)) {
    if (Object.getOwnPropertyDescriptors(target)[propertyKey].writable === true) {
      target[propertyKey] = value;
    }
  } else {
    Object.defineProperty(target, propertyKey, {
      value,
      configurable,
      writable,
      enumerable
    });
  }
}

function defineOGProperty(target: Attr | Text | IElement | Node
  , properties: Record<string, any> = {}): void {
  if (target.hasOwnProperty("__OG__")) {
    objectMerge((target as TElement).__OG__, properties);
  } else {
    defineProperty(target, "__OG__", properties, false, false, false);
  }
}

function getObjectProperty(target: object, propertyNames: string[]): any {
  if (typeof target[propertyNames[0]] === "object") {
    if (propertyNames.slice(1).length > 0) {
      return getObjectProperty(target[propertyNames[0]], propertyNames.slice(1));
    }
    return target[propertyNames[0]];
  }
  return target[propertyNames[0]];
}

function generateObjectTree(propertyNames: string[], endPropertyValue: object = {}): object {
  const tree = {};

  if (propertyNames.length === 1) {
    tree[propertyNames[0]] = endPropertyValue;
  } else {
    tree[propertyNames[0]] = generateObjectTree(propertyNames.slice(1), endPropertyValue);
  }
  return tree;
}

export default {
  objectMerge,
  defineProperty,
  defineOGProperty,
  getObjectProperty,
  generateObjectTree
}
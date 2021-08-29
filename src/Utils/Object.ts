import { IElement } from "../Typings/CustomElementTypings";

function objectMerge(target: object, source: object): void {
  for (const key in source) {
    if (!source.hasOwnProperty(key)) return;
    const targetItem = target[key];
    const sourceItem = source[key];

    if (typeof targetItem === "object") {
      if (Array.isArray(targetItem)) {
        targetItem.push(...sourceItem);
      } else {
        objectMerge(targetItem, sourceItem);
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
    objectMerge(target, properties);
  } else {
    defineProperty(target, "__OG__", properties, false, false, false);
  }
}

function getObjectProperty(target: object, propertyNames: string[]): any {
  if (target[propertyNames[0]]) {
    if (typeof target[propertyNames[0]] === "object") {
      return getObjectProperty(target[propertyNames[0]], propertyNames.slice(1));
    }
    return target[propertyNames[0]];
  }
  return target;
}

export default {
  objectMerge,
  defineProperty,
  defineOGProperty,
  getObjectProperty
}
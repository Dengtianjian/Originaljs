import { IElement, TElement } from "../Typings/CustomElementTypings";

function objectMerge(target: object, source: object): void {
  for (const key in source) {
    if (!source.hasOwnProperty(key)) return;
    const targetItem = target[key];
    const sourceItem = source[key];

    if (typeof targetItem === "object" && targetItem !== null) {
      if (targetItem instanceof Map) {
        if (typeof sourceItem === "object") {
          if (sourceItem instanceof Map) {
            sourceItem.forEach((item, key) => {
              targetItem.set(key, item);
            })
          } else {
            for (const key in sourceItem) {
              if (!sourceItem.hasOwnProperty(key)) continue;
              targetItem.set(key, sourceItem[key]);
            }
          }
        } else {
          targetItem.set(sourceItem[key], sourceItem[key]);
        }
      } else if (Array.isArray(targetItem)) {
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

const filterPropertyKeys: string[] = ["properties", "refTree"];
function filterAppendProperties(target: (Attr | Text | IElement | Node) & { __OG__: {} }, appendProperties: object): void {
  const OG = target.__OG__;
  filterPropertyKeys.forEach(keyItem => {
    if (OG[keyItem] && appendProperties[keyItem]) {
      delete appendProperties[keyItem];
    }
  });
}
function defineOGProperty(target: Attr | Text | IElement | Node
  , appendProperties: Record<string, any> = {}): void {
  if (target.hasOwnProperty("__OG__")) {
    // @ts-ignore
    filterAppendProperties(target, appendProperties);
    objectMerge((target as TElement).__OG__, appendProperties);
  } else {
    defineProperty(target, "__OG__", appendProperties, false, false, false);
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
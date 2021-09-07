import { IElement, TElement } from "../Typings/CustomElementTypings";

/**
 * 合并两个对象，会修改目标对象，而不是返回新的对象
 * @param target 合并到目标对象
 * @param source 合并的对象数据
 * @returns 空
 */
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

/**
 * 给对象定义一个属性，是对Object.defineProperty的封装
 * @param target 目标对象
 * @param propertyKey 定义的属性名称
 * @param value 属性值
 * @param configurable 可配置
 * @param writable 可写入
 * @param enumerable 可枚举
 */
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
/**
 * 定义对象的OG属性。如果目标存在OG属性就合并，否则就定义
 * @param target 目标
 * @param appendProperties 附加的属性
 */
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

/**
 * 获取目标对象的属性值。
 * @param target 目标对象
 * @param propertyNames 属性名称数组，每一个代表一个层级。例如：['obj','a','b'] 就是 obj->a->c的值
 * @returns 获取到属性值
 */
function getObjectProperty(target: object, propertyNames: string[]): any {
  if (typeof target[propertyNames[0]] === "object") {
    if (propertyNames.slice(1).length > 0) {
      return getObjectProperty(target[propertyNames[0]], propertyNames.slice(1));
    }
    return target[propertyNames[0]];
  }
  return target[propertyNames[0]];
}

/**
 * 根据传入的属性名称生成有层级的对象。例如：['obj','a','c'] 生成后 {obj:{a:{c:endPropertyValue } } } }
 * @param propertyNames 属性名称数组
 * @param endPropertyValue 属性值
 * @returns 生成对象
 */
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
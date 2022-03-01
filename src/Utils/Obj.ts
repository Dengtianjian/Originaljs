import Transform from "../Reactive/Transform";

/**
 * 合并两个对象，会修改目标对象，而不是返回新的对象
 * @param target 合并到目标对象
 * @param source 合并的对象数据
 * @returns 空
 */
function objectMerge(target: any, source: any): void {
  if (typeof target !== "object" || typeof source !== "object") return;
  if (source instanceof Map || target instanceof Map) {
    if (target instanceof Map && source instanceof Map) {
      source.forEach((item, key) => {
        if (target.has(key)) {
          objectMerge(target.get(key), item);
        } else {
          target.set(key, item);
        }
      });
    } else if (typeof target === "object" && source instanceof Map) {
      source.forEach((item, key) => {
        target[key] = item;
      });
    } else {
      target = source;
    }
  } else if (Array.isArray(target) || Array.isArray(source)) {
    if ((Array.isArray(target) && !Array.isArray(source)) || (!Array.isArray(target) && Array.isArray(source))) {
      target = source;
    } else {
      target.push(...source);
    }
  } else if (source !== null && typeof source === "object" && target !== null) {
    for (const key in source) {
      if (source.hasOwnProperty(key) === false) continue;
      if (target.hasOwnProperty(key) && typeof target[key] === "object" && typeof source[key] === "object") {
        objectMerge(target[key], source[key]);
      } else if (target instanceof Map) {
        target.set(key, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

/**
 * 获取目标对象的属性值。
 * @param target 目标对象
 * @param propertyNames 属性名称数组，每一个代表一个层级。例如：['obj','a','b'] 就是 obj->a->c的值
 * @returns 获取到属性值
 */
function getObjectProperty(target: object, propertyNames: (string | symbol)[]): any {
  if (typeof target[propertyNames[0]] === "object") {
    if (propertyNames.slice(1).length > 0) {
      return getObjectProperty(target[propertyNames[0]], propertyNames.slice(1));
    }
    return target[propertyNames[0]];
  }
  return target[propertyNames[0]];
}

export function deepSetObjectPropertyValue(obj: object, propertyNames: string[] | string, value: any): void {
  propertyNames = Array.isArray(propertyNames) ? propertyNames : Transform.transformPropertyKey(propertyNames);

  if (propertyNames.length == 1) {
    obj[propertyNames[0]] = value;
  } else {
    let firstKey: string = propertyNames[0];
    propertyNames.shift();
    deepSetObjectPropertyValue(obj[firstKey], propertyNames, value);
  }
}

/**
 * 判断是否是可迭代对象
 * @param obj 任意对象
 * @returns 是否是可迭代对象
 */
function isIterable(obj: any): boolean {
  return obj !== null && typeof obj[Symbol.iterator] === "function";
}

function cloneMap(obj: Map<any, any>): Map<any, any> {
  const cloneMap = new Map();
  obj.forEach((v, k) => {
    cloneMap.set(k, v);
  });
  return cloneMap;
}

export default {
  objectMerge,
  getObjectProperty,
  deepSetObjectPropertyValue,
  isIterable,
  cloneMap
}
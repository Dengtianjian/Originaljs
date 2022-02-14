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

export default {
  objectMerge
}
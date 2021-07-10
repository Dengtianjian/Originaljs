import Collect from "./collect";
import { ExtractVariableName } from "./rules";

function parseRef(refTree: object, rawData: object, path: string[] = []) {
  for (const branchName in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, branchName)) {
      if (rawData[branchName] !== undefined) {
        if (typeof rawData[branchName] === "object") {
          path.push(branchName);
          replaceRefContent(refTree, rawData, branchName, path);
          parseRef(refTree[branchName], rawData[branchName], path);
          path.pop();
        } else {
          replaceRefContent(refTree, rawData, branchName, path);
        }
      }
    }
  }
}

function replaceRefContent(refTree, rawData, branchName, path) {
  const replaceValue: string = rawData[branchName].toString();
  if (refTree[branchName]['__els'] && refTree[branchName]['__els'].length > 0) {
    refTree[branchName]['__els'].forEach(el => {
      el.textContent = replaceValue;
    })
  }
  if (refTree[branchName]['__attrs'] && refTree[branchName]['__attrs'].length > 0) {
    const attrs: Attr[] = refTree[branchName]['__attrs'];
    for (const attr of attrs) {
      let refs = attr.nodeValue.match(new RegExp(ExtractVariableName, "g"));

      if (refs === null) {
        continue;
      }
      path.push(branchName);
      let pathString: string = path.join(".");
      refs.forEach(ref => {
        const propertyStrings: string[] = parseRefString(ref);
        if (pathString === propertyStrings.join(".")) {
          let replaceSource = ref.replace(/([\[\]\.])/g, "\\$1");
          attr.nodeValue = attr.nodeValue.replace(new RegExp(`\{\x20*${replaceSource}\x20*\}`, "g"), replaceValue);
        }
      })
      path.pop();
    }
  }
}

function parseString(sourceString: string, rawData: any): string {
  const refs = sourceString.match(new RegExp(ExtractVariableName, "g"));

  refs.forEach(ref => {
    const propertyStrings = parseRefString(ref);
    const replaceValue = Collect.getPropertyData(propertyStrings, rawData);

    sourceString = sourceString.replaceAll(`{${ref}}`, replaceValue.toString());
  });
  return sourceString;
}

function parseRefString(refString: string): string[] {
  if (/(?<=\])\w/.test(refString) || /\W+^[\u4e00-\u9fa5]/.test(refString)) {
    throw new Error("🐻兄dei，语法错误：" + refString);
  }
  const splitChars: string[] = refString.split("");
  const propertys: string[] = [];
  let fragment: string = ""; //* [] 段
  let arounds: number = 0; //* 记录遇到了 [ 的次数
  let hitComma: boolean = false; //* 命中了逗号 .
  splitChars.forEach(charItem => {
    switch (charItem) {
      case "[":
        //* 进入包围圈
        ++arounds;
        //* 把以后的Push
        if (fragment) {
          propertys.push(fragment);
        }
        //* 清空存储的，重新开始记录属性名
        fragment = "";
        break;
      case "]":
        //* 进入包围圈的数量递减
        --arounds;
        if (fragment) {
          propertys.push(fragment);
        }
        fragment = "";
        break;
      case ".":
        //* 把已有的push
        //* 然后清空，重新开始记录属性名
        if (fragment) {
          propertys.push(fragment);
          fragment = "";
        }
        //* 命中了 .
        hitComma = true;
        break;
      default:
        hitComma = false;
        if (!["'", "\"", "\\"].includes(charItem)) {
          fragment += charItem.trim();
        }
        break;
    }
  });
  if (fragment) {
    hitComma = false;
    propertys.push(fragment);
    fragment = "";
  }

  if (hitComma || arounds) {
    throw new Error("🐻兄dei，语法错误：" + refString);
  }

  return propertys;
}

export default {
  parseRef,
  replaceRefContent,
  parseString,
  parseRefString
}
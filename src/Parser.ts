import { getPropertyData } from "./Property";
import { Ref } from "./Rules";
import { IProperties } from "./types/Properties";

export function parseDom(DOMString): Node[] {
  const DP: DOMParser = new DOMParser();
  const document: Document = DP.parseFromString(DOMString, "text/html");
  const headChildNodes: NodeListOf<ChildNode> = document.querySelector("head").childNodes;
  const bodyChildNodes: NodeListOf<ChildNode> = document.querySelector("body").childNodes;
  const nodes: Node[] = [
    ...Array.from(headChildNodes),
    ...Array.from(bodyChildNodes)
  ];
  return nodes;
}

export function transformPropertyName(propertyNameString: string): string[] {
  // if (/(?<=\])\w/.test(propertyNameString) || /\W+^[\u4e00-\u9fa5]/.test(propertyNameString)) {
  //   throw new Error("Template syntax error:" + propertyNameString);
  // }
  const splitChars: string[] = propertyNameString.split("");
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
    throw new Error("Template syntax error:" + propertyNameString);
  }

  return propertys;
}

export function transformValueToString(value: any): string {
  if (typeof value === "object" && !Array.isArray(value)) {
    let objItems: string[] = [];

    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (Array.isArray(value[key])) {
          objItems.push(key + ":[" + value[key].toString() + "]");
        } else if (typeof value[key] === "object" && !Array.isArray(value)) {
          objItems.push(key + ":" + transformValueToString(value[key]));
        } else {
          if (typeof value[key] !== "object" || typeof value[key] === undefined) {
            value[key] = value[key].toString();
          }
          objItems.push(key + ":" + value[key]);
        }
      }
    }

    return "{" + objItems.join(",") + "}";
  }
  if (typeof value === "object" || typeof value === undefined) {
    value = value.toString();
  }

  return value;
}

export function propertyNamesToPath(propertyNames: string[] | number[]): string {
  let propertyPath: string = "";
  propertyNames.forEach(item => {
    if (isNaN(item)) {
      propertyPath += "." + item;
    } else {
      propertyPath += `[${item}]`;
    }
  });
  if (propertyPath[0] === ".") {
    propertyPath = propertyPath.slice(1);
  }

  return propertyPath;
}

export function parse(sourceString: string, properties: IProperties, quotesAdd: Boolean = false): string {
  const refs = sourceString.match(new RegExp(Ref.ExtractVariableName, "g"));
  
  refs.forEach(ref => {
    let replaceValue: string | number = transformValueToString(getPropertyData(ref, properties));

    if (quotesAdd) {
      if (typeof replaceValue === "string") {
        replaceValue = `"${replaceValue}"`;
      }
    }
    sourceString = sourceString.replaceAll(`{${ref}}`, replaceValue)
  });

  return sourceString;
}
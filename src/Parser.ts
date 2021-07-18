import { getPropertyData } from "./Property";
import { Ref } from "./Rules";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr } from "./types/Ref";
import { updateRef } from "./View";

export function parseDom(DOMString): Node[] {
  const DP: DOMParser = new DOMParser();
  const document: Document = DP.parseFromString(DOMString, "text/html");
  const headChildNodes: NodeListOf<ChildNode> =
    document.childNodes[0].childNodes[0].childNodes;
  const bodyChildNodes: NodeListOf<ChildNode> =
    document.childNodes[0].childNodes[1].childNodes;
  const nodes: Node[] = [
    ...Array.from(headChildNodes),
    ...Array.from(bodyChildNodes)
  ];
  return nodes;
}

export function transformPropertyName(propertyNameString: string): string[] {
  if (/(?<=\])\w/.test(propertyNameString) || /\W+^[\u4e00-\u9fa5]/.test(propertyNameString)) {
    throw new Error("Template syntax error:" + propertyNameString);
  }
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

export function parseRef(refTree: IRefTree, properties: IProperties, refProperty: IProperties =
  {}): void {
  for (const branchName in refTree) {
    if (!Object.prototype.hasOwnProperty.call(refTree, branchName)) continue;
    if (refProperty[branchName] === undefined) continue;

    if (typeof refProperty[branchName] === "object") {
      parseRef(refTree[branchName], properties, refProperty[branchName]);
    }
    updateRef(refTree, properties, branchName);
  }
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
          objItems.push(key + ":" + value[key].toString())
        }
      }
    }

    return "{" + objItems.join(",") + "}";
  }
  return value.toString();
}

export function parse(sourceString: string, properties: IProperties): string {
  const refs = sourceString.match(new RegExp(Ref.ExtractVariableName, "g"));

  refs.forEach(ref => {
    const propertyNames: string[] = transformPropertyName(ref);
    const replaceValue: string = transformValueToString(getPropertyData(propertyNames, properties));

    sourceString = sourceString.replaceAll(`{${ref}}`, replaceValue)
  });

  return sourceString;
}
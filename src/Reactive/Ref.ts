import Reactive from ".";
import Module from "../Module";
import { RefRules } from "../old_Reactive/Rules";
import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefRecord } from "../Typings/RefTypings";
import Utils from "../Utils";
import Parser from "./Parser";

function traverseNodes(target: TElement | TElement[], properties: ICustomElement): TRefRecord {
  const refRecord: TRefRecord = {};
  if (!Array.isArray(target)) {
    target = [target];
  }
  if (target instanceof NodeList) {
    target = Array.from(target);
  }

  for (const elementItem of target) {
    for (const refPart of Module.useAll<TRefRecord>("reactive.collecElRef", [elementItem, properties])) {
      Utils.objectMerge(refRecord, refPart);
    }

    //* 是否跳过标签属性收集
    if ((!elementItem.__OG__ || (elementItem.__OG__ && !elementItem.__OG__.skipAttrCollect)) && elementItem.attributes && elementItem.attributes.length > 0) {
      Array.from(elementItem.attributes).forEach((attrItem) => {
        for (const refPart of Module.useAll<TRefRecord>("reactive.collectAttrRef", [attrItem, properties, elementItem])) {
          Utils.objectMerge(refRecord, refPart);
        }
      });
    }

    if (!elementItem.__OG__ || (elementItem.__OG__ && !elementItem.__OG__.skipChildNodeCollect)) {
      if (elementItem.childNodes && elementItem.childNodes.length > 0) {
        for (const nodeItem of Array.from(elementItem.childNodes)) {
          Utils.objectMerge(refRecord, traverseNodes(nodeItem as TElement, properties));
        }
      }
    }
  }

  return refRecord;
}
function collectRef(target: TElement | TElement[], properties: ICustomElement, reactiveInstance: Reactive): TRefRecord {
  const refRecord: TRefRecord = {};

  for (const refPart of Module.useAll<TRefRecord>("reactive.collectRef", Array.from(arguments))) {
    Utils.objectMerge(refRecord, refPart);
  }

  Utils.objectMerge(refRecord, traverseNodes(target, properties));

  return refRecord;
}

/**
 * 判断模板字符串是变量或者表达式，还是普通字符串
 * @param refString 模板字符串
 * @returns true=是变量或者表达式，false=普通字符串
 */
function isRef(refString: string): boolean {
  return RefRules.refItem.test(refString);
}

const GlobalMatchRefs: RegExp = new RegExp(RefRules.refItem, "g");
function collectExpression(sourceString: string): string[] {
  return sourceString.match(GlobalMatchRefs);
}
function extractExpression(expressionRawString: string[]): string[] {
  return expressionRawString.map((expressionsRawString) => {
    return expressionsRawString;
  });
}
function getExpression(sourceString: string, extract: boolean = true, transformPropertyNameToArray: boolean = true): string[] | string[][] {
  let expressionsRaw: string[] | string[][] = collectExpression(sourceString);
  expressionsRaw = expressionsRaw.map((expressionRawString) => {
    console.log(Parser.parseExpression(expressionRawString));

    return expressionRawString;
  });

  if (extract) {
    expressionsRaw = extractExpression(expressionsRaw);
  }

  return expressionsRaw;
}

export default {
  collectRef,
  isRef,
  collectExpression,
  getExpression,
};

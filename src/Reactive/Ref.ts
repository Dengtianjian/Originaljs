import Reactive from ".";
import Module from "../Module";
import { RefRules } from "./Rules";
import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefMap, TRefRecord, TRefs } from "../Typings/RefTypings";
import Utils from "../Utils";
import Parser from "./Parser";
import Transform from "./Transform";
import View from "./View";

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
    if (RefRules.expressionItem.test(expressionsRawString) === false) return expressionsRawString.trim();
    const matchResult: string[] = expressionsRawString.match(RefRules.extractRefItem);
    return matchResult ? matchResult[0].trim() : null;
  });
}
function getExpression(sourceString: string, extract: boolean = true): string[] {
  let expressionsRaw: string[] = collectExpression(sourceString);

  const expressions: string[] = [];
  expressionsRaw.forEach((expressionRawString, itemIndex) => {
    let parseResult: string[] = Parser.parseExpression(expressionRawString);
    if (extract) {
      parseResult = extractExpression(parseResult);
    }

    expressions.push(...parseResult);
  });

  return expressions;
}

const ExtractGlobalPropertyKey: RegExp = new RegExp(RefRules.extractVariableName, "g");
function getRefPropertyKey(expression: string, transformToArray: boolean = true): string[] | string[][] {
  let propertyKeys: string[] | string[][] = expression.match(ExtractGlobalPropertyKey);
  propertyKeys = propertyKeys.map(keyItem => {
    return keyItem.trim();
  });
  propertyKeys = Array.from(new Set(propertyKeys));

  if (transformToArray) {
    propertyKeys = propertyKeys.map(keyItem => {
      return Transform.transformPropertyKeyToArray(keyItem);
    })
  }

  return propertyKeys;
}

function generateRefRecord(propertyKeys: string[], target: unknown, mapKey: symbol, endPropertyValue: any = {}, endPropertyKey?: string): TRefRecord {
  if (!endPropertyKey) {
    if (target instanceof Attr) {
      endPropertyKey = "__attrs";
    } else if (target instanceof Text) {
      endPropertyKey = "__texts";
    }
  }

  switch (endPropertyKey) {
    case "__attrs":
    case "__texts":
      endPropertyValue = target;
      break;
    case "__methods":
      endPropertyValue = {
        ...endPropertyValue,
        target
      }
      break;
  }

  const refRecord: Map<symbol, any> = new Map();
  refRecord.set(mapKey, endPropertyValue);

  return {
    [propertyKeys.join()]: {
      [endPropertyKey]: refRecord
    }
  };
}

function updateRefMap(refRecord: TRefRecord, properties: ICustomElement) {
  for (const propertyKey in refRecord) {
    const propertyKeys: string[] = propertyKey.split(",");

    const refs: TRefs = refRecord[propertyKey];
    let target: any = null;
    if (propertyKeys.length === 1) {
      target = properties;
    } else {
      target = Utils.getObjectProperty(properties, propertyKeys.slice(0, propertyKeys.length - 1));
    }
    const currentPropertyKey: string = propertyKeys[propertyKeys.length - 1];
    const value: any = target[currentPropertyKey];

    View.setUpdateView(refs, target, currentPropertyKey, value, properties);
  }
}

export default {
  collectRef,
  isRef,
  collectExpression,
  getExpression,
  getRefPropertyKey,
  generateRefRecord,
  updateRefMap
};

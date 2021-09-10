import Module from "../Module";
import { ICustomElement, TAttr, TElement, TReferrerRefInfo, TText } from "../Typings/CustomElementTypings";
import { TExpressionItem } from "../Typings/ExpressionTypings";
import { TRefInfo, TRefRecord, TRefTree } from "../Typings/RefTypings";
import Utils from "../Utils";
import Expression from "./Expression";
import Parser from "./Parser";
import { RefRules } from "./Rules";
import Transform from "./Transform";
import View from "./View";
const matchRefItem: RegExp = new RegExp(RefRules.refItem, "g");
const matchAndExtract: RegExp = new RegExp(RefRules.extractRefItem, "g");
const matchAndExtractVariableName: RegExp = new RegExp(RefRules.extractVariableName, "g");

/**
 * 获取模板片段的引用key，包括表达式以及属性
 * @param sourceString 模板片段
 * @param extract 是否抽取引用key，如果不抽取就会返回 ['{ user.a }']，否则就返回 ['user.a']，也就是没有大括号
 * @returns 引用key
 */
function getRefKey(sourceString: string, extract: boolean = true): string[] {
  let refs: string[] = Parser.parseRefString(sourceString);
  console.log(refs);


  if (extract) {
    return refs.map(refItem => {
      const extract: string[] = refItem.match(matchAndExtract);
      if (extract) return extract[0].trim();
    });
  }
  return refs.map(refItem => {
    return refItem.trim();
  });
}

/**
 * 获取模板片段里的引用属性名
 * @param sourceString 模板片段
 * @param transformPropertyNameToArray 是否转换属性名为数组
 * @returns 模板里的引用属性名数组
 */
function collecRef(sourceString: string, transformPropertyNameToArray: boolean = true): string[][] | string[] {
  let refs: string[] | string[][] = sourceString.match(matchAndExtractVariableName) || [];

  refs = refs.map(refItem => {
    refItem = refItem.trim();
    if (transformPropertyNameToArray) {
      // @ts-ignore
      refItem = Transform.transformPropertyNameToArray(refItem);
    }
    return refItem;
  });


  return refs;
}

/**
 * 递归更新refTree视图
 * @param refTree 引用数
 * @param refProperties 根标签，也是数据保存的
 */
function updateRef(refMap: TRefRecord, refProperties: ICustomElement): void {
  for (const propertyNameString in refMap) {
    const propertyNames: string[] = propertyNameString.split(",");

    let branchProperty: Record<string, any> = Utils.getObjectProperty(refProperties, propertyNames);
    if (branchProperty === undefined) continue;

    View.setUpdateView(refMap[propertyNameString], branchProperty, refProperties);
  }
}

function generateRefTreeByRefString(refString: string, target: Attr | Text | Element, branchKey: symbol, endBranch?: Record<string, any>, endBranchName?: string): TRefTree {
  const refs: string[] = getRefKey(refString, false);
  if (refs.length === 0) return {};

  const refTree: TRefTree = {};
  refs.forEach(refItem => {
    const refPropertyNames: string[][] | string[] = collecRef(refItem);

    refPropertyNames.forEach(propertyNames => {
      Utils.objectMerge(refTree, generateRefTree(propertyNames, target, branchKey, endBranch,
        endBranchName));
    });
  });
  return refTree;
}

function generateRefTree(propertyNames: string[], target: unknown, branchKey: symbol, endBranch: Record<string, any> = {}, endBranchName?: string): TRefTree {
  let expression: string = "";
  if (!endBranchName) {
    if (target instanceof Attr) {
      endBranchName = "__attrs";
      expression = target.nodeValue;
    } else if (target instanceof Text) {
      endBranchName = "__els";
      expression = target.textContent;
    }
    if (Expression.isExpression(expression) === true) {
      endBranchName = "__expressions";
    }
  }

  switch (endBranchName) {
    case "__expressions": {
      endBranch = {
        ...endBranch,
        ...Expression.handleExpressionRef(expression, target as Text | Attr)
      };
    }
      break;
    case "__attrs":
    case "__els":
      endBranch = target;
      break;
    case "__methods":
      endBranch = {
        ...endBranch,
        target
      };
      break;
  }

  const branchValue: Map<symbol, any> = new Map();
  branchValue.set(branchKey, endBranch);
  return {
    [propertyNames.join()]: {
      [endBranchName]: branchValue
    }
  }
  // return Utils.generateObjectTree(propertyNames, {
  //   [endBranchName]: branchValue
  // });
}

/**
 * 解析字符串并且生成引用信息
 * @param refString 模板字符串
 * @returns 数据引用信息
 */
function parseTemplateGenerateRefInfo(refString: string): TRefInfo {
  let expressionInfo: TExpressionItem | null = null;
  let type: string = "";
  let refPropertyNames: string[][] = [];
  if (Expression.isExpression(refString)) {
    type = "expression";
    expressionInfo = Expression.handleExpressionRef(refString);
  } else {
    type = "variable";
    refPropertyNames = collecRef(refString, true) as string[][];
  }

  return {
    type,
    expressionInfo,
    refPropertyNames
  }
}

/**
 * 解析引用信息返回数据
 * @param refInfo 引用信息，根据parseTemplateGenerateRefInfo返回
 * @param properties 数据
 * @returns 解析结果
 */
function parenRefInfo(refInfo: TRefInfo, properties: ICustomElement): any {
  let result: any = null;
  switch (refInfo.type) {
    case "expression":
      result = Expression.executeExpression(refInfo.expressionInfo.expression, properties.__OG__.properties, refInfo.expressionInfo.refPropertyNames);
      break;
    case "variable":
      if (refInfo.refPropertyNames.length > 0) {
        const refPropertyName: string[] = refInfo.refPropertyNames[0];
        result = Utils.getObjectProperty(properties, refPropertyName);
      }
      break;
  }
  return Transform.transformObjectToString(result);
}

/**
 * 判断模板字符串是变量或者表达式，还是普通字符串
 * @param refString 模板字符串
 * @returns true=是变量或者表达式，false=普通字符串
 */
function isRef(refString: string): boolean {
  return RefRules.matchRefItem.test(refString);
}

/**
 * 清除元素的引用
 * @param target 目标元素
 * @param isDeep 是否递归，如果是true 就会遍历元素下的childNodes
 * @returns 空
 */
function clearElRef(target: TElement, isDeep: boolean = false): void {
  if (isDeep && target.childNodes && target.childNodes.length > 0) {
    target.childNodes.forEach(nodeItem => {
      clearElRef(nodeItem as TElement, true);
    });
  }

  if (!target.__OG__) return;
  Module.useAll("reactive.clearRefTree", Array.from(arguments));

  Module.useAll("reactive.clearElRefTree", [
    target,
    ...arguments,
  ]);
}

function removeRefByRefererRefInfo(refs: Record<keyof TRefTree, Map<symbol, string[] | string[][]>>, refMap: Map<string, TRefTree>): void {
  for (const type in refs) {
    if (!refs.hasOwnProperty(type)) continue;
    const propertyKeyMap: Map<symbol, string[] | string[][]> = refs[type];
    propertyKeyMap.forEach((propertyNames, itemKey) => {
      if (propertyNames[0] && Array.isArray(propertyNames[0])) {
        propertyNames.forEach(secondPropertyNames => {
          const branch: TRefTree = refMap.get(secondPropertyNames.join());
          if (!branch[type]) return;
          branch[type].delete(itemKey);
        })
      } else if (propertyNames.length > 0) {
        const branch: TRefTree = refMap.get(propertyNames.join());
        if (!branch[type]) return;
        branch[type].delete(itemKey);
      }
    });
  }
}

export default {
  collecRef,
  getRefKey,
  updateRef,
  generateRefTree,
  generateRefTreeByRefString,
  parseTemplateGenerateRefInfo,
  parenRefInfo,
  isRef,
  clearElRef,
  removeRefByRefererRefInfo
}
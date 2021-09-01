import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefTree } from "../Typings/RefTreeTypings";
import Utils from "../Utils";
import Expression from "./Expression";
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
  let refs: string[] = sourceString.match(extract ? matchAndExtract : matchRefItem) || [];

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
function updateRef(refTree: TRefTree, refProperties: ICustomElement | TElement | Record<string, any>): void {
  for (const branchName in refTree) {
    if (refProperties[branchName] === undefined) continue;
    let branch: TRefTree = refTree[branchName];
    let branchProperty: Record<string, any> = refProperties[branchName];

    if (typeof branch === "object") {
      updateRef(branch, branchProperty);
    }
    View.setUpdateView(refProperties, branchName, branchProperty, refProperties);
  }
}

function generateRefTreeByRefString(refString: string, target: Attr | Text, endBranch?: Record<string, any>, endBranchName?: string): TRefTree {
  const refs: string[] = getRefKey(refString, false);
  if (refs.length === 0) return {};

  const refTree: TRefTree = {};
  refs.forEach(refItem => {
    const refPropertyNames: string[][] | string[] = collecRef(refItem);

    refPropertyNames.forEach(propertyNames => {
      Utils.objectMerge(refTree, generateRefTree(propertyNames, target, endBranch,
        endBranchName));
    });
  });
  return refTree;
}

function generateRefTree(propertyNames: string[], target: unknown, endBranch: Record<string, any> = {}, endBranchName?: string): TRefTree {
  let expression: string = "";
  if (!endBranchName) {
    if (target instanceof Attr) {
      endBranchName = "__attrs";
      expression = target.nodeValue;
    } else if (target instanceof Text) {
      endBranchName = "__els";
      expression = target.textContent;
    }
    if (RefRules.extractExpression.test(expression) === true) {
      endBranchName = "__expressions";
    }
  }

  switch (endBranchName) {
    case "__expressions": {
      endBranch = [
        {
          ...endBranch,
          ...Expression.handleExpressionRef(expression, target as Attr | Text)
        }
      ];
    }
    case "__attrs":
    case "__els":
      endBranch = [target];
      break;
    case "__methods":
      endBranch = [
        {
          ...endBranch,
          target
        }
      ];
      break;
  }

  return Utils.generateObjectTree(propertyNames, {
    [endBranchName]: endBranch
  });
}

export default {
  collecRef,
  getRefKey,
  updateRef,
  generateRefTree,
  generateRefTreeByRefString
}
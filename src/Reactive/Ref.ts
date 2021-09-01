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

function generateRefTree(propertyNames: string[], target: unknown, endBranch: Record<string, any> = {}): TRefTree {
  if (target instanceof Attr) {
    if (RefRules.extractExpression.test(target.textContent) === true) {
      endBranch['__expressions'] = [
        Expression.handleExpressionRef(target.nodeValue, target)
      ];
    } else {
      endBranch['__attrs'] = [target];
    }
  } else if (target instanceof Text) {
    if (RefRules.extractExpression.test(target.textContent) === true) {
      endBranch['__expressions'] = [
        Expression.handleExpressionRef(target.textContent, target)
      ];
    } else {
      endBranch['__els'] = [target];
    }
  }

  return Utils.generateObjectTree(propertyNames, endBranch);
}

export default {
  collecRef,
  getRefKey,
  updateRef,
  generateRefTree
}
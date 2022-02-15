import CustomElement from "../CustomElement";
import RegExpRules from "../RegExpRules";
import { TExpressionInfo, TRefItem, TRefs } from "../Typings/RefType";
import Obj from "../Utils/Obj";
import Module from "./Module";
import Parser from "./Parser";

/**
 * 合并插值引用
 * @param target 插值引用
 * @param source 被合并插值引用
 */
function mergeRefs(target: TRefs, source: TRefs) {
  for (const refKey in source) {
    if (!target[refKey]) {
      target[refKey] = source[refKey];
      continue;
    }
    const refItem: TRefItem = target[refKey];
    refItem.__els.push(...source[refKey].__els);
  }
}

/**
 * 收集表达式
 * @param template 模板HTML
 * @returns 表达式信息
 */
function collectExpression(template: string): TExpressionInfo[] {
  if (!template || RegExpRules.matchExpression.test(template) === false) return [];
  const { 0: expression }: string[] = template.match(new RegExp(RegExpRules.matchExpression, "g"));

  const expressions: Array<TExpressionInfo> = [];
  const raw: string = expression;
  const expressionInfo = Parser.parseTemplateToStatement(expression);

  expressions.push({
    ...expressionInfo,
    raw,
    refKeyMap: new Map()
  });

  return expressions;
}

/**
 * 收集插值引用
 * @param target 目标元素
 * @returns 引用
 */
function collectRefs(target: Node | Element | Node[] | NodeList | HTMLCollection, root: CustomElement): TRefs {
  const refs: TRefs = {};

  if (Array.isArray(target) || target instanceof HTMLCollection || target instanceof NodeList) {
    Array.from(target).forEach(nodeItem => {
      mergeRefs(refs, collectRefs(nodeItem, root));
    });
  } else {
    if (target.nodeType === 1) {
      mergeRefs(refs, collectRefs(Array.from(target.childNodes), root));
    }
    Module.useAll<TRefs>("collectRefs", arguments, (result) => {
      if (result !== null) {
        mergeRefs(refs, result);
      }
    });
  }



  return refs;
}

export default {
  collectExpression,
  collectRefs,
  mergeRefs
}
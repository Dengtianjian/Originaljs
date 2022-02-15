import CustomElement from "../CustomElement";
import RegExpRules from "../RegExpRules";
import { TStatement, TRefItem, TRefs, TRefItemKeys } from "../Typings/RefType";
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
function collectStatement(template: string): TStatement[] {
  if (!template || RegExpRules.matchStatement.test(template) === false) return [];
  const { 0: statement }: string[] = template.match(new RegExp(RegExpRules.matchStatement, "g"));

  const statements: Array<TStatement> = [];
  const raw: string = statement;
  const statementInfo = Parser.parseTemplateToStatement(statement);

  statements.push({
    ...statementInfo,
    raw,
    refKeyMap: new Map()
  });

  return statements;
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
    Module.useAll<TRefs>("collectRefs", arguments, (result) => {
      if (result !== null) {
        mergeRefs(refs, result);
      }
    });
    if (target.nodeType === 1) {
      mergeRefs(refs, collectRefs(Array.from(target.childNodes), root));
    }
  }
  return refs;
}

function addRefToRefs<T>(target: TRefs, refKey: string, refKeys: string[], key: keyof TRefItemKeys, option: T) {
  target[refKey] = {
    __els: [],
    __for: [],
    __refKeys: [...refKeys]
  };

  switch (key) {
    case "__els":
      target[refKey]["__els"].push(option);
      break;
    case "__for":
      // @ts-ignore 泛型
      target[refKey]["__for"].push(option);
      break;
  }
}

export default {
  collectStatement,
  collectRefs,
  mergeRefs,
  addRefToRefs
}
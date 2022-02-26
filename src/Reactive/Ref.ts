import CustomElement from "../CustomElement";
import RegExpRules from "../RegExpRules";
import { TStatement, TRefItem, TRefs, TRefItemKeys } from "../Typings/RefType";
import Module from "./Module";
import Parser from "./Parser";
import Transform from "./Transform";

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
    const targetRefItem: TRefItem = target[refKey];
    const sourceRefItem: TRefItem = source[refKey];
    for (const type in targetRefItem) {
      if (type === "__refKeys") continue;
      targetRefItem[type].push(...sourceRefItem[type]);
    }
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

  statements.push(Parser.parseTemplateToStatement(statement));

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

function addRefToRefs<T>(target: TRefs, refKeys: string[], key: keyof TRefItemKeys, option: T) {
  const refKey: string = Transform.transformPropertyKeyToString(refKeys);
  if (target[refKey] === undefined) {
    target[refKey] = {
      __els: [],
      __for: [],
      __style: [],
      __refKeys: [...refKeys]
    };
  }

  switch (key) {
    case "__els":
      target[refKey]["__els"].push(option);
      break;
    case "__for":
      // @ts-ignore 泛型
      target[refKey]["__for"].push(option);
      break;
    case "__style":
      // @ts-ignore 泛型
      target[refKey]["__style"].push(option);
      break;
  }
}

const globalmatchStyleVariable: RegExp = new RegExp(RegExpRules.matchStyleVariable, "g");
/**
 * 收集Style标签的引用插值
 * @param template 模板
 * @returns 收集到的引用插值
 */
function collectStyleElInterpolation(template: string): Record<string, string> {
  const refInterpolation: Record<string, string> = {};
  let refVariables: string[] = template.match(globalmatchStyleVariable);
  refVariables = Array.from(new Set(refVariables));
  refVariables.forEach(refItem => {
    const interpolationMatch = refItem.match(RegExpRules.extacStyleVariableRef);

    if (interpolationMatch) {
      let interpolation: string = interpolationMatch[0];
      if (["\"", "'"].includes(interpolation.charAt(0))) {
        interpolation = interpolation.slice(1, interpolation.length - 1);
      }

      refInterpolation[refItem] = interpolation;
    }
  })

  return refInterpolation;
}

export default {
  collectStatement,
  collectRefs,
  mergeRefs,
  addRefToRefs,
  collectStyleElInterpolation
}
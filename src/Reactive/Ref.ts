import RegExpRules from "../RegExpRules";
import { TRefItem, TRefs } from "../Typings/RefType";
import Parser from "./Parser";
import Transform from "./Transform";

type TExpressionInfo = {
  raw: string,
  refKeyMap: Map<string, Array<string>>,
  refs: string[],
  refsRaw: string[],
  statements: string[],
  statementsRaw: string[],
  executableStatements: Map<string, string>,
  statementRefMap: Map<string, string[]>
}

const passCollectTags: string[] = ["SCRIPT", "STYLE"];

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
function collectRefs(target: Node[] | Node): TRefs {
  if (!Array.isArray(target) && passCollectTags.includes(target.nodeName) && target.nodeType === 1) {
    return {};
  }
  const refs: TRefs = {};
  //* 没有引用的表达式，即时执行表达式
  Object.defineProperty(refs, "__emptyRefs__", {
    value: {
      __els: [],
      __refKeys: []
    },
    configurable: false,
    enumerable: true
  });

  if (Array.isArray(target) || target instanceof NodeList) {
    Array.from(target).forEach(childNode => {
      mergeRefs(refs, this.collectRefs(childNode));
    });
    return refs;
  }
  if (target instanceof Text === false) {
    if (target.childNodes.length > 0) {
      mergeRefs(refs, this.collectRefs(target.childNodes));
    }
    return refs;
  }
  if (!target.textContent.trim()) {
    return refs;
  }

  const parentElement = target.parentElement;
  const expressions: TExpressionInfo[] = this.collectExpression(target.textContent);

  const newTexts: Text[] = [];
  expressions.forEach(({ statementRefMap, refKeyMap, executableStatements }, index) => {
    statementRefMap.forEach((refKeysRawStrings, expression) => {
      let index: number = target.textContent.indexOf(expression);
      const beforeContent: string = target.textContent.slice(0, index);
      if (beforeContent) {
        target.textContent = target.textContent.slice(beforeContent.length);
        newTexts.push(new Text(beforeContent));
      }

      const expressionTextEl: Text = new Text(expression);
      newTexts.push(expressionTextEl);
      target.textContent = target.textContent.slice(expression.length);

      //* 没有引用的表达式
      if (refKeysRawStrings.length === 0) {
        refs.__emptyRefs__.__els.push({
          target: expressionTextEl,
          expression: {
            refs: refKeysRawStrings,
            value: executableStatements.get(expression),
            raw: expression,
            refKey: []
          }
        })
      }

      refKeysRawStrings.forEach(refKey => {
        const refKeys: string[] = Transform.transformPropertyKey(refKey);
        refs[refKey] = {
          __els: [{
            target: expressionTextEl,
            expression: {
              refs: refKeysRawStrings,
              value: executableStatements.get(expression),
              raw: expression,
              refKey: refKeys
            }
          }],
          __refKeys: refKeys
        }
        refKeyMap.set(refKey, refKeys);
      })
    })
  });

  newTexts.push(new Text(target.textContent));
  target.textContent = "";
  newTexts.forEach(newTextItem => {
    parentElement.insertBefore(newTextItem, target);
  });

  return refs;
}

export default {
  collectExpression,
  collectRefs
}
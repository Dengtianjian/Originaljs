import RegExpRules from "../RegExpRules";
import { TRefs } from "../Typings/RefType";
import Obj from "../Utils/Obj";
import Parser from "./Parser";
import Transform from "./Transform";

type TExpressionInfo = {
  raw: string,
  refs: string[],
  refKeyMap: Map<string, Array<string>>,
  refsRaw: string[];
  expressions: string[];
  expressionsRaw: string[];
  executableExpressions: Map<string, string>;
  expressionRefMap: Map<string, string[]>;
}

export default {
  collectExpression(template: string): TExpressionInfo[] {
    if (!template || RegExpRules.matchExpression.test(template) === false) return [];
    const marchExpressions: string[] = template.match(new RegExp(RegExpRules.matchExpression, "g"));
    const expressions: Array<TExpressionInfo> = [];
    marchExpressions.forEach((expression, index) => {
      const raw: string = expression;
      const expressionInfo = Parser.parseTemplateGetExpression(expression);
      expressions.push({
        ...expressionInfo,
        raw,
        refKeyMap: new Map()
      });
    });
    return expressions;
  },
  collectRefs(target: Node[] | Node): TRefs {
    const refs: TRefs = {};

    if (Array.isArray(target) || target instanceof NodeList) {
      Array.from(target).forEach(childNode => {
        Obj.objectMerge(refs, this.collectRefs(childNode));
      });
      return refs;
    }
    if (target instanceof Text === false) {
      if (target.childNodes.length > 0) {
        Obj.objectMerge(refs, this.collectRefs(target.childNodes));
      }
      return refs;
    }
    if (!target.textContent.trim()) {
      return refs;
    }

    const parentElement = target.parentElement;
    const expressions: TExpressionInfo[] = this.collectExpression(target.textContent);

    const newTexts: Text[] = [];
    expressions.forEach(({ expressionRefMap, refKeyMap, executableExpressions }, index) => {
      expressionRefMap.forEach((refKeysRawStrings, expression) => {
        let index: number = target.textContent.indexOf(expression);
        const beforeContent: string = target.textContent.slice(0, index);
        if (beforeContent) {
          target.textContent = target.textContent.slice(beforeContent.length);
          newTexts.push(new Text(beforeContent));
        }

        const expressionTextEl: Text = new Text(expression);
        newTexts.push(expressionTextEl);
        target.textContent = target.textContent.slice(expression.length);

        refKeysRawStrings.forEach(refKey => {
          const refKeys: string[] = Transform.transformPropertyKey(refKey);
          refs[refKey] = {
            __els: [{
              target: expressionTextEl,
              expression: {
                refs: refKeysRawStrings,
                value: executableExpressions.get(expression),
                raw: expression,
                refKey: refKeys
              }
            }]
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
}
import { TModuleOptions } from "../../Typings/ModuleType";
import { TExpressionInfo, TRefs } from "../../Typings/RefType";
import Obj from "../../Utils/Obj";
import Ref from "../Ref";
import Transform from "../Transform";

const passCollectTags: string[] = ["SCRIPT", "STYLE", "CODE"];

function collectRefs(target: Node | Node[] | NodeList): TRefs {
  const refs: TRefs = {};

  if (!Array.isArray(target) && passCollectTags.includes((target as Node).nodeName) && (target as Node).nodeType === 1) {
    return refs;
  }
  //* 没有引用的表达式，即时执行表达式
  Object.defineProperty(refs, "__emptyRefs__", {
    value: {
      __els: [],
      __refKeys: []
    },
    configurable: false,
    enumerable: true
  });

  if (Array.isArray(target) || target instanceof NodeList || target instanceof HTMLCollection) {
    Array.from(target).forEach(childNode => {
      Ref.mergeRefs(refs, collectRefs(childNode));
    });
    return refs;
  }

  if (target instanceof Text === false) {
    if (target.childNodes.length > 0) {
      Ref.mergeRefs(refs, collectRefs(target.childNodes));
    }
    return refs;
  }
  if (!target.textContent.trim()) {
    return refs;
  }

  const parentElement = target.parentElement;
  const expressions: TExpressionInfo[] = Ref.collectExpression(target.textContent);

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
  collectRefs
} as TModuleOptions
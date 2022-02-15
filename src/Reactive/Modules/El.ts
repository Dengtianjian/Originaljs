import CustomElement from "../../CustomElement";
import { TModuleOptions } from "../../Typings/ModuleType";
import { TStatement, TRefs } from "../../Typings/RefType";
import Ref from "../Ref";
import Transform from "../Transform";

const passCollectTags: string[] = ["SCRIPT", "STYLE", "CODE"];

function collectRefs(target: Node | Element): TRefs {
  if (passCollectTags.includes((target as Node).nodeName) && (target as Node).nodeType === 1) {
    return {};
  }
  if (!(target instanceof Text)) {
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

  if (!target.textContent.trim()) {
    return refs;
  }

  const parentElement = target.parentElement;
  const expressions: TStatement[] = Ref.collectStatement(target.textContent);

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
          __for: [],
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
  name: "El",
  collectRefs
} as TModuleOptions
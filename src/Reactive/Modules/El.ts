import CustomElement from "../../CustomElement";
import { TModuleOptions } from "../../Typings/ModuleType";
import { TStatement, TRefs, TRefItem } from "../../Typings/RefType";
import Ref from "../Ref";
import View from "../View";

const passCollectTags: string[] = ["SCRIPT", "STYLE", "CODE"];

function collectRefs(target: Node | Element): TRefs {
  if (passCollectTags.includes((target as Node).nodeName) && (target as Node).nodeType === 1) {
    return {};
  }
  if (passCollectTags.includes(target.parentElement.nodeName)) {
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
      __for: [],
      __refKeys: []
    },
    configurable: false,
    enumerable: true
  });

  if (!target.textContent.trim()) {
    return refs;
  }

  const parentElement = target.parentElement;
  const statements: TStatement[] = Ref.collectStatement(target.textContent);

  const newTexts: Text[] = [];
  statements.forEach(({ statementRefsMap, statementsRaw, executableStatements, refKeyMap, refKeysMap }) => {
    statementsRaw.forEach(statementRaw => {
      const statementRefs: string[] = statementRefsMap.get(statementRaw) ?? [];

      const statementTextEl: Text = new Text(statementRaw);

      if (statementRefs.length) {
        statementRefs.forEach((refRawStr) => {
          Ref.addRefToRefs(refs, refKeysMap.get(refRawStr), "__els", {
            target: statementTextEl,
            statement: {
              refs: [refKeyMap.get(refRawStr)],
              value: executableStatements.get(statementRaw),
              raw: statementRaw
            }
          });
        });
      } else {
        //* 没有引用的语句
        refs.__emptyRefs__.__els.push({
          target: statementTextEl,
          statement: {
            refs: [],
            value: executableStatements.get(statementRaw),
            raw: statementRaw
          }
        })
      }

      const positionIndex: number = target.textContent.indexOf(statementRaw);
      const breforeText: string = target.textContent.slice(0, positionIndex);
      target.textContent = target.textContent.slice(breforeText.length + statementRaw.length);
      newTexts.push(new Text(breforeText));
      newTexts.push(statementTextEl);
    })
  });

  newTexts.push(new Text(target.textContent));
  target.textContent = "";
  newTexts.forEach(newTextItem => {
    parentElement.insertBefore(newTextItem, target);
  });

  return refs;
}

function updateView(refItem: TRefItem, refKeys: string[], target: any, data: CustomElement) {
  refItem.__els.forEach(item => {
    item.target.textContent = View.executeStatement(item.statement.value, data);
  });
}

export default {
  name: "El",
  collectRefs,
  updateView
} as TModuleOptions
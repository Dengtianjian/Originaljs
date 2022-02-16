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
  console.log(statements);

  const newTexts: Text[] = [];
  statements.forEach(({ refs: statementRefs, statementRefsMap, statementRawMap, statementsRaw, executableStatements, refKeyMap, refKeysMap }) => {
    statementsRaw.forEach(statementRaw => {
      const statementRawTemp: string = statementRaw;
      const statement: string = statementRawMap.get(statementRaw);
      const statementRefs: Map<string, number> = statementRefsMap.get(statementRaw) ?? new Map<string, number>();

      const statementNewTexts: Text[] = [];

      if (statementRefs.size) {
        statementRefs.forEach((refCount, ref) => {
          for (let index = 0; index < refCount; index++) {
            const positionIndex: number = statementRaw.indexOf(ref);

            statementNewTexts.push(new Text(statementRaw.slice(0, positionIndex)));
            statementRaw = statementRaw.slice(positionIndex);

            const refTextEl: Text = new Text(statementRaw.substring(0, ref.length));
            statementNewTexts.push(refTextEl);
            statementRaw = statementRaw.slice(ref.length);

            Ref.addRefToRefs(refs, refKeyMap.get(ref), refKeysMap.get(ref), "__els", {
              target: refTextEl,
              statement: {
                refs: [refKeyMap.get(ref)],
                value: executableStatements.get(statementRaw),
                raw: statementRawTemp
              }
            })
          }
        });
        statementNewTexts.push(new Text(statementRaw));
      } else {
        const positionIndex: number = target.textContent.indexOf(statementRaw);

        statementNewTexts.push(new Text(target.textContent.slice(0, positionIndex)))
        target.textContent = target.textContent.slice(positionIndex);

        const statementTextEl: Text = new Text(statementRaw);
        statementNewTexts.push(statementTextEl);
        target.textContent = target.textContent.slice(0, statementRaw.length);

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

      const positionIndex: number = target.textContent.indexOf(statementRawTemp);
      const breforeText: string = target.textContent.slice(0, positionIndex);
      target.textContent = target.textContent.slice(breforeText.length + statementRawTemp.length);
      newTexts.push(new Text(breforeText));
      newTexts.push(...statementNewTexts);
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
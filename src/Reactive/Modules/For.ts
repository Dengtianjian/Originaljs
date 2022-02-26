import CustomElement from "../../CustomElement";
import { TModuleOptions } from "../../Typings/ModuleType";
import { TStatement, TRefs, TRefItemTypeFor, TRefItem } from "../../Typings/RefType";
import Obj from "../../Utils/Obj";
import Ref from "../Ref";
import Transform from "../Transform";
import View from "../View";

function collectRefs(target: Node | Element): TRefs {
  if (target.nodeName !== "O-FOR") {
    return null;
  }

  const refs: TRefs = {};

  const attributes: NamedNodeMap = (target as Element).attributes;
  if (attributes.length === 0) return null;
  let itemAttr: Attr = null;
  let indexAttr: Attr = null;
  let keyAttr: Attr = null;
  let inAttr: Attr = attributes.getNamedItem("in");
  if (!inAttr) return null;

  if (attributes.length > 1) {
    itemAttr = attributes.item(0);
    if (attributes.length === 4) {
      keyAttr = attributes.item(1);
      indexAttr = attributes.item(2);
    }
    if (attributes.length === 3) {
      indexAttr = attributes.item(1);
    }
  }

  const itemName: string = itemAttr?.nodeName ?? "item";
  const indexName: string = indexAttr?.nodeName ?? "index";
  const keyName: string = keyAttr?.nodeName ?? "key";
  const refKey: string = inAttr.value;
  const template: string = (target as Element).innerHTML;
  const statements: TStatement[] = Ref.collectStatement(refKey);

  statements.forEach(({ statementRefsMap, refKeysMap, executableStatements, statementsRaw, refKeyMap }) => {
    statementsRaw.forEach((statementRaw) => {
      const statementRefs: string[] = statementRefsMap.get(statementRaw) ?? [];

      statementRefs.forEach(refRawStr => {
        Ref.addRefToRefs<TRefItemTypeFor>(refs, refKeysMap.get(refRawStr), "__for", {
          target: target as Element,
          statement: {
            refs: statementRefs,
            value: executableStatements.get(statementRaw),
            raw: statementRaw
          },
          for: {
            itemName,
            indexName,
            keyName,
            refRawKey: refKey,
            refKey: refKeyMap.get(refRawStr),
            template
          }
        });
      })
    });
  });
  (target as Element).innerHTML = "";

  return refs;
}

function updateView(refItem: TRefItem, refKeys: string[], target: any, root: CustomElement) {
  if (refKeys.includes("__emptyRefs__")) return;

  if (target.__proxy__) {
    refItem.__for.forEach(forItem => {
      if (target.__proxy__.refKey === forItem.for.refKey) {
        let index: number = 0;
        for (const key in target) {
          const propertyKey: string = Transform.transformPropertyKeyToString([...refKeys, key]);
          const template: string = forItem.for.template.replace(new RegExp(`(?<=\{{1} *)${forItem.for.itemName}`, "g"), propertyKey);
          View.render(template, forItem.target as Element, root);
          index++;
        }
      } else {
        forItem.target.textContent += forItem.for.template;
      }
    });
  }
}

function set(refKeys: string[], target: any, root: CustomElement): void {
  const refKey: string = refKeys[refKeys.length - 1];
  if (refKey === "length") return;

  const fors = root.__OG__.refs[Transform.transformPropertyKeyToString(refKeys.slice(0, refKeys.length - 1))].__for;

  fors.forEach(forItem => {
    const propertyKey: string = Transform.transformPropertyKeyToString(refKeys);
    const template: string = forItem.for.template.replace(new RegExp(`(?<=\{{1} *)${forItem.for.itemName}`, "g"), propertyKey);
    View.render(template, forItem.target as Element, root);
  });
}

export default {
  name: "For",
  collectRefs,
  updateView,
  set
} as TModuleOptions
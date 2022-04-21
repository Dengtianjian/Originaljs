import CustomElement from "../../CustomElement";
import { TModuleOptions } from "../../Typings/ModuleType";
import { TStatement, TRefs, TRefItemTypeFor, TRefItem, TPropertyRef, TForMark } from "../../Typings/RefType";
import Obj from "../../Utils/Obj";
import Module from "../Module";
import Parser from "../Parser";
import PropertyProxy from "../PropertyProxy";
import Ref from "../Ref";
import Transform from "../Transform";
import View from "../View";

function collectRefs(target: Node | Element, root): TRefs {
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
        const refKeys: string[] = refKeysMap.get(refRawStr);
        Object.defineProperty(Obj.getObjectProperty(root, refKeys), "__for__", {
          value: true,
          configurable: false,
          enumerable: false,
          writable: false
        })
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

/**
 * const users=[0,1,2,3];
 * 1. users=[4,5,6];
 * 2. users.push(7);
 * {{ users }}
 * {{ users[0] }}
 * {{ users[0].name }}
 */

export default {
  name: "For",
  collectRefs,
  setBefore(refKeys, target, root) {
    console.log("set");

  },
  reflectBefore(refItem, refKeys, target: object & TForMark, oldValue, root) {
    if (!target.__for__) {
      return;
    }

    refItem.__for.forEach(forItem => {
      for (const key in target) {
        const propertyKey: string = Transform.transformPropertyKeyToString([...refKeys, key]);
        const template: string = forItem.for.template.replace(new RegExp(`(?<=\{{1} *)${forItem.for.itemName}`, "g"), propertyKey);
        const els = Parser.parseDom(template);

        const refs = Ref.collectRefs(els, root);
        Ref.mergeRefs(root.__OG__.refs, refs);
        // (forItem.target as HTMLElement).append(...els);
      }

    });

    return true;
  },
  reflectAfter(refItem: TRefItem, refKeys: string[], target: object & TForMark, newValue: unknown, root: CustomElement) {
    if ((typeof target === "object" && !target.__for__) || refKeys.includes("__emptyRefs__")) {
      return;
    }

    // for (const key in newValue as object) {
    //   const propertyKey: string = Transform.transformPropertyKeyToString([...refKeys, key]);
    //   View.updateView(root.__OG__.refs[propertyKey], [...refKeys, key], Obj.getObjectProperty(root, [...refKeys, key]), root);
    // }


    return true;
  },
  updateView(refItem: TRefItem, refKeys: string[], target: any, data: CustomElement) {
    console.log(refItem);

  },
  inject(el: HTMLElement, root: CustomElement) {
    el.childNodes.forEach(nodeItem => {
      const statement = Ref.collectStatement(nodeItem.attributes['in'].value)[0];
      const executeStatment = statement.executableStatements.get(statement.raw);
      const refKeys: string[] = statement.refKeysMap.values().next().value;
      const target = Obj.getObjectProperty(root, refKeys);
      const template = nodeItem.innerHTML;
      nodeItem.innerHTML = "";
      console.log(target);

      const newEl = document.createElement("o-for");
      // newEl.setAttribute("in", statement);
      for (const key in target) {
        const propertyKey: string = Transform.transformPropertyKeyToString([...refKeys, key]);
        const keyT: string = template.replace(new RegExp(`(?<=\{{1} *)item`, "g"), propertyKey);
        newEl.innerHTML += keyT;
      }
      nodeItem.parentElement.append(newEl);
      console.log();

    })
  }
} as TModuleOptions
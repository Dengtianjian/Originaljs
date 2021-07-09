import { IElement } from "../../../types/elementType";
import { TRefTree } from "../../../types/pluginType";
import Collect from "../collect";
import { ExtractVariableName, VariableItem } from "../rules";

export default {
  collectRef(El: IElement): TRefTree {
    if (El.__og_isCollected) {
      return {};
    }
    let ScopedElRefTree: TRefTree = {};
    if (!El.attributes || El.attributes.length === 0) {
      return ScopedElRefTree;
    }

    let rawString: string = "";
    for (const attrItem of Array.from(El.attributes)) {
      if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
        rawString = attrItem.nodeValue;
        const refs: string[] = attrItem.nodeValue.match(new RegExp(VariableItem, "g"));
        const attrStrings = new Map<string, string>();
        refs.forEach(refItem => {
          const proviousString = rawString.slice(0, rawString.indexOf(refItem));
          rawString = rawString.slice(proviousString.length + refItem.length);
          const variabledName: RegExpMatchArray = refItem.match(ExtractVariableName);

          if (proviousString) {
            attrStrings.set(String(attrStrings.size), proviousString);
          }
          attrStrings.set(variabledName[0].trim(), refItem);

          if (variabledName) {
            const propertyNames: string[] = Collect.parsePropertyString(variabledName[0].trim());
            const RefTree = Collect.generateElRefTree(propertyNames, attrItem);
            ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, RefTree) as TRefTree;
          }

        });
        attrStrings.set(String(attrStrings.size), rawString);
        Object.defineProperty(attrItem, "__og_attrs", {
          value: attrStrings,
          configurable: false,
          enumerable: false,
          writable: false
        });

      }
    }
    return ScopedElRefTree;
  }
}
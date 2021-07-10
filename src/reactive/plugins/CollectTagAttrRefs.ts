import { IElement } from "../../types/elementType";
import { TRefTree } from "../../types/pluginType";
import utils from "../../utils";
import Collect from "../collect";
import parser from "../parser";
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

    for (const attrItem of Array.from(El.attributes)) {
      if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
        const refs: string[] = attrItem.nodeValue.match(new RegExp(VariableItem, "g"));

        refs.forEach(refItem => {
          const variabledName: RegExpMatchArray = refItem.match(ExtractVariableName);

          if (variabledName) {
            const propertyNames: string[] = parser.parseRefString(variabledName[0].trim());
            const RefTree = Collect.generateElRefTree(propertyNames, attrItem);
            ScopedElRefTree = utils.objectAssign(ScopedElRefTree, RefTree) as TRefTree;
          }
        });

        Object.defineProperty(attrItem, "__og_attrs", {
          value: {
            rawNodeValue: attrItem.nodeValue
          },
          configurable: false,
          enumerable: false,
          writable: false
        });
      }
    }
    return ScopedElRefTree;
  }
}
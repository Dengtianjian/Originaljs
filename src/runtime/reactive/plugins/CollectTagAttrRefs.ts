import { IElement } from "../../../types/elementType";
import { TRefTree } from "../../../types/pluginType";
import Collect from "../collect";

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
        const refs: string[] = attrItem.nodeValue.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
        console.log(refs);

        refs.forEach(refItem => {
          const propertyNames: string[] = Collect.parsePropertyString(refItem);
          const RefTree = Collect.generateElRefTree(propertyNames, attrItem);
          ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, RefTree) as TRefTree;
        });
      }
    }
    return ScopedElRefTree;
  }
}
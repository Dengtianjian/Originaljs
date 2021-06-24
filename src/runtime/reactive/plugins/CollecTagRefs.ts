import { IElement } from "../../../types/elementType";
import { IPluginItem, TRefTree } from "../../../types/pluginType";
import plugin from "../../plugin";
import Collect from "../collect";

export default {
  collectTagRefs(El: IElement) {
    let ScopedElRefTree = {};

    if (El.__og_isCollected) {
      return ScopedElRefTree;
    }

    if (El.childNodes.length > 0) {
      for (const childNode of Array.from(El.childNodes)) {
        ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.collectTagRefs(childNode as IElement));
      }
    }

    if (El.attributes && El.attributes.length > 0) {
      ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, (plugin.use("CollectAttrRefs") as IPluginItem).collectRef(El));
    }

    El.__og_isCollected = true;

    if (El.nodeType !== 3) {
      return ScopedElRefTree;
    }

    let refs: RegExpMatchArray = El.textContent.match(/(?<=\{\x20*).+?(?=\x20*\})/g);

    if (refs === null) {
      return ScopedElRefTree;
    }
    const parentNode: HTMLElement = El.parentNode as HTMLElement;
    refs = Array.from(new Set(refs));
    const appendTextEls: Text[] = [];
    for (let index = 0; index < refs.length; index++) {
      const refRawString: string = refs[index].trim();
      const newTextEl: Text = document.createTextNode("{" + refRawString + "}");
      const propertyNames: string[] = Collect.parsePropertyString(refRawString);
      ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, Collect.generateElRefTree(propertyNames, newTextEl));

      appendTextEls.push(newTextEl, document.createTextNode("\n"));
      const replaceRegString: string = "\{\x20*" + refRawString.replace(/([\.\[\]])/g, "\\$1") + "\x20*\}";
      El.textContent = El.textContent.replace(new RegExp(replaceRegString), "");
    }
    appendTextEls.forEach(el => {
      parentNode.insertBefore(el, El);
    });

    return ScopedElRefTree;
  },
  collectRef(El: IElement) {
    let ScopedElRefTree = {};

    if (El.__og_isCollected) {
      return ScopedElRefTree;
    }

    ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.collectTagRefs(El));

    return ScopedElRefTree;
  }
} as IPluginItem & { collectTagRefs(): TRefTree }
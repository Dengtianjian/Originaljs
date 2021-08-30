import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Ref from "../Ref";

export default {
  reactive: {
    collecElRef(target: TElement | TElement[], rootEl: ICustomElement): TRefTree {
      const refTree: TRefTree = {};

      if (Array.isArray(target)) {
        target.forEach(nodeItem => {
          Utils.objectMerge(refTree, this.reactive.collectElRef(nodeItem, rootEl));
        });
        return refTree;
      }

      if ((target.__OG__ && target.__OG__.elementCollected) || target.textContent === "") return;
      Utils.defineOGProperty(target, {
        elementCollected: true
      });

      if (target.nodeType !== 3) return refTree;

      const refs: string[] = Ref.getRefKey(target.textContent, false);
      if (refs.length === 0) return refTree;

      const parentNode: TElement = target.parentNode as TElement;
      const newTextChildNodes: Text[] = [];
      refs.forEach(refItem => {
        const previousText: string = target.textContent.slice(0, target.textContent.indexOf(refItem));
        if (previousText) {
          newTextChildNodes.push(document.createTextNode(previousText));
          target.textContent = target.textContent.slice(target.textContent.indexOf(refItem));
        }
        const refPropertyNames: string[][] = Ref.collecRef(refItem);
        const newTextEl: Text = document.createTextNode(refItem);

        Utils.defineOGProperty(newTextEl, {
          elementParsed: false
        });

        refPropertyNames.forEach(propertyNames => {
          Utils.objectMerge(refTree, Utils.generateObjectTree(propertyNames, {
            __els: [newTextEl]
          }));
        });

        newTextChildNodes.push(newTextEl);
        target.textContent = target.textContent.slice(refItem.length);
      });

      for (const newTextItem of newTextChildNodes) {
        parentNode.insertBefore(newTextItem, target);
      }

      Utils.defineOGProperty(parentNode, {
        hasRefs: true
      });

      return refTree;
    }
  }
} as TModuleOptions
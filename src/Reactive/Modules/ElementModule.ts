import { ICustomElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Ref from "../Ref";
import { RefRules } from "../Rules";
import Transform from "../Transform";

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
        const refPropertyNames: string[][] | string[] = Ref.collecRef(refItem);
        const newTextEl: Text = document.createTextNode(refItem);

        let defineProperties: Record<string, any> = {
          elementParsed: false,
        };
        Utils.defineOGProperty(newTextEl, defineProperties);

        const refTreePart: TRefTree = {};
        const refPropertyKeyMap: Map<symbol, string[]> = new Map();
        refPropertyNames.forEach(propertyNames => {
          const branchKey: symbol = Symbol(propertyNames.toString());
          refPropertyKeyMap.set(branchKey, propertyNames);
          Utils.objectMerge(refTreePart, Ref.generateRefTree(propertyNames, newTextEl, branchKey));
        });

        newTextChildNodes.push(newTextEl);
        target.textContent = target.textContent.slice(refItem.length);

        Utils.defineOGProperty(newTextEl, {
          properties: rootEl,
          ref: {
            propertyKeyMap: refPropertyKeyMap
          }
        });
        Utils.objectMerge(refTree, refTreePart);
      });

      for (const newTextItem of newTextChildNodes) {
        parentNode.insertBefore(newTextItem, target);
      }

      return refTree;
    },
    setUpdateView(refTree: TRefTree, properties: Record<string, any>, value: any): void {
      if (refTree?.__els === undefined) return;

      refTree.__els.forEach(elItem => {
        elItem.textContent = Transform.transformObjectToString(value);
      });
    },
    clearElRefTree(target: Text & { [key: string]: any } & TElement): void {
      const ref = target.__OG__.ref;

      ref.propertyKeyMap.forEach((propertyItem, itemKey) => {
        const branch: TRefTree = Utils.getObjectProperty(target.__OG__.properties.__OG__.refTree, propertyItem);
        if (branch.__els) {
          branch.__els.delete(itemKey);
        }
      });
    }
  }
} as TModuleOptions
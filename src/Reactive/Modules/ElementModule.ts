import { ICustomElement, TElement, TReferrerElement, TReferrerElementOGProperties, TReferrerRefInfo, TText } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Ref from "../Ref";
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
        const isExpression: boolean = Expression.isExpression(refItem);

        const refTreePart: TRefTree = {};
        const refPropertyKeyMap: Map<symbol, string[]> = new Map();
        refPropertyNames.forEach(propertyNames => {
          const branchKey: symbol = Symbol(propertyNames.toString());
          refPropertyKeyMap.set(branchKey, propertyNames);
          Utils.objectMerge(refTreePart, Ref.generateRefTree(propertyNames, newTextEl, branchKey));
        });

        newTextChildNodes.push(newTextEl);
        target.textContent = target.textContent.slice(refItem.length);

        Utils.defineOGProperty(parentNode.tagName === "O-EL" ? newTextEl : parentNode, {
          properties: rootEl,
          refTree: rootEl.__OG__.reactive.refTree,
          refs: {
            [isExpression ? '__expressions' : '__els']: refPropertyKeyMap
          }
        } as TReferrerElementOGProperties);
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
        elItem.textContent = Transform.transformObjectToString(value).toString();
      });
    },
    clearElRefTree(target: TReferrerElement): void {
      if (!target.__OG__ || !target.__OG__.refs) return;
      Ref.removeRefByRefererRefInfo(target.__OG__.refs, target.__OG__.properties.__OG__.refTree);
    }
  }
} as TModuleOptions
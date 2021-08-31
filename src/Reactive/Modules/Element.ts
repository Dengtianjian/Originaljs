import { ICustomElement, IElement, TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
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
        //* 内容是表达式处理
        const isExpression: boolean = RefRules.expressionItem.test(refItem);

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
        const branchValue: Record<string, object[]> = {};
        if (isExpression) {
          branchValue['__expressions'] = [
            Expression.handleExpressionRef(refItem, newTextEl)
          ]
        } else {
          branchValue['__els'] = [newTextEl];
        }
        refPropertyNames.forEach(propertyNames => {
          let propertyRef: TRefTree = Utils.generateObjectTree(propertyNames, branchValue);
          Utils.objectMerge(refTreePart, propertyRef);
        });

        newTextChildNodes.push(newTextEl);
        target.textContent = target.textContent.slice(refItem.length);

        Utils.defineOGProperty(newTextEl, {
          properties: rootEl,
          ref: {
            tree: refTreePart,
            propertyNames: refPropertyNames
          }
        });
        Utils.objectMerge(refTree, refTreePart);
      });

      for (const newTextItem of newTextChildNodes) {
        parentNode.insertBefore(newTextItem, target);
      }

      Utils.defineOGProperty(parentNode, {
        hasRefs: true
      });

      return refTree;
    },
    setUpdateView(refTree: TRefTree, properties: Record<string, any>, value: any, propertyNames: string[]): void {
      if (refTree.__els === undefined) return;
      const els: TElement[] = refTree.__els;

      els.forEach(el => {
        el.textContent = Transform.transformObjectToString(value);
      });
    }
  }
} as TModuleOptions
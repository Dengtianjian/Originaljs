import { TElement, TReferrerElementOGProperties } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefRecord } from "../../Typings/RefTypings";
import Ref from "../Ref";
import Utils from "../../Utils";

export default {
  reactive: {
    collecElRef(
      target: TElement<{
        elementCollected?: boolean;
      }>,
      properties
    ): TRefRecord {
      if (target.nodeType !== 3 || target.textContent === "") return {};
      if (target.__OG__ && target.__OG__.elementCollected) return {};
      if (Ref.isRef(target.textContent) === false) return {};

      const expressions: string[] = Ref.getExpression(target.textContent.trim(), false);
      if (expressions.length === 0) return {};

      const parentNode: TElement | ParentNode = target.parentNode;
      const newTextChildNodes: Text[] = [];
      const refRecord: TRefRecord = {};

      expressions.forEach(expressionItem => {
        const previousText: string = target.textContent.slice(0, target.textContent.indexOf(expressionItem));

        if (previousText) {
          newTextChildNodes.push(document.createTextNode(previousText));
          target.textContent = target.textContent.slice(target.textContent.indexOf(expressionItem));
        }

        const newText: Text = document.createTextNode(expressionItem);
        const refPropertyKeys: string[][] = Ref.getRefPropertyKey(expressionItem, true) as string[][];

        const refKeyMap: Map<symbol, string[]> = new Map();
        refPropertyKeys.forEach(propertyKey => {
          const mapKey: symbol = Symbol(propertyKey.join());
          refKeyMap.set(mapKey, propertyKey);
          Utils.objectMerge(refRecord, Ref.generateRefRecord(propertyKey, newText, mapKey))
        });
        newTextChildNodes.push(newText);

        Utils.defineOGProperty<TReferrerElementOGProperties>(newText, {
          properties,
          refs: {
            "__els": refKeyMap
          },
        });

        target.textContent = target.textContent.slice(expressionItem.length);
      });

      for (const newText of newTextChildNodes) {
        parentNode.insertBefore(newText, target);
      }

      return refRecord;
    },
  },
} as TModuleOptions;

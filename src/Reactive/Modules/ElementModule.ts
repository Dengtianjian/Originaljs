import { RefRules } from "../../old_Reactive/Rules";
import { TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefRecord } from "../../Typings/RefTypings";
import Ref from "../Ref";

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

      const expressions: string[][] = Ref.getExpression(target.textContent.trim(), true) as string[][];
    },
  },
} as TModuleOptions;

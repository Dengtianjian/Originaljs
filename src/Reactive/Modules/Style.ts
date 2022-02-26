import CustomElement from "../../CustomElement";
import { TModuleOptions } from "../../Typings/ModuleType";
import { TRefItem, TRefItemTypeStyle, TRefs } from "../../Typings/RefType";
import Obj from "../../Utils/Obj";
import Ref from "../Ref";
import Transform from "../Transform";

export default {
  name: "Style",
  collectRefs(target: Element, root: CustomElement): TRefs {
    if (target.nodeName !== "STYLE") {
      return {};
    }
    const refs: TRefs = {};

    const styleRule: string = target.textContent;
    const refInterpolation: Record<string, string> = Ref.collectStyleElInterpolation(styleRule);

    for (const variableKey in refInterpolation) {
      const interpolation: string = refInterpolation[variableKey];
      const refKeys: string[] = Transform.transformPropertyKey(interpolation);
      const newVariableKey: string = `o-${refKeys.join("")}`;
      const refKey: string = Transform.transformPropertyKeyToString(refKeys);

      let cssVariableName: string = `--${newVariableKey}`;
      target.textContent = styleRule.replaceAll(variableKey, `var(${cssVariableName})`);

      Ref.addRefToRefs<TRefItemTypeStyle>(refs, refKeys, "__style", {
        target,
        raw: styleRule,
        cssVariableName,
        statement: {
          refs: refKeys,
          value: `this.${interpolation}`,
          raw: variableKey
        }
      });
    }

    return refs;
  },
  updateView(refItem: TRefItem, refKeys: string[], target, root: CustomElement) {
    if (!refItem.__style || refItem.__style.length === 0) return;

    refItem.__style.forEach(styleRefItem => {
      root.style.setProperty(styleRefItem.cssVariableName, Obj.getObjectProperty(root, styleRefItem.statement.refs));
    });
  }
} as TModuleOptions
import CustomElement from "../CustomElement";
import { TRefItem, TRefs } from "../Typings/RefType";
import Obj from "../Utils/Obj";
import Module from "./Module";
import Transform from "./Transform";

export default {
  executeStatement(statement: string, data: CustomElement): string {
    let result: any = null;
    try {
      result = new Function(`return ${statement}`).call(data);
      if (typeof result === "function") {
        result = result();
      }
    } catch (e) {
      console.log(statement);
      throw e;
    }

    return Transform.transformObjectToString(result).toString();
  },
  updateRefView(refs: TRefs, data: CustomElement) {
    for (const refKey in refs) {
      const refItem: TRefItem = refs[refKey];
      const refKeys: string[] = Transform.transformPropertyKey(refKey);
      const targetData: any = Obj.getObjectProperty(data, refKeys);
      this.updateView(refItem, refKeys, targetData, data);
    }
  },
  updateView(refItem: TRefItem, refKeys: string[], data: CustomElement) {
    Module.useAll("updateView", arguments);
  }
}
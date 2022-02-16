import CustomElement from "../CustomElement";
import { TRefItem, TRefs } from "../Typings/RefType";
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
      // if (refKey === "__emptyRefs__") {
      //   continue;
      // }
      const refItem: TRefItem = refs[refKey];
      this.updateView(refItem, data);
    }
  },
  updateView(refItem: TRefItem, data: CustomElement) {
    Module.useAll("updateView", arguments);
  }
}
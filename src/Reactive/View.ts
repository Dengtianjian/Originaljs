import CustomElement from "../CustomElement";
import { TRefItem, TRefs } from "../Typings/RefType";

export default {
  executeExpression(expression: string, data: CustomElement) {
    // console.log(expression);

    const result: any = new Function(`return ${expression}`).call(data);

    return result;
  },
  updateRefView(refs: TRefs, data: CustomElement) {
    for (const refKey in refs) {
      const refItem: TRefItem = refs[refKey];
      refItem.__els.forEach(item => {
        item.target.textContent = this.executeExpression(item.expression.value, data);
      });
    }
  }
}
import { TElement } from "../../Typings/CustomElementTypings";
import { TExpressionItem } from "../../Typings/ExpressionTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTreeTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Transform from "../Transform";

export default {
  reactive: {
    setUpdateView(refTree: TRefTree, properties: TElement) {
      if (refTree?.__expressions === undefined) return;
      const expressions: Map<symbol, TExpressionItem> = refTree.__expressions;

      expressions.forEach(expressionItem => {
        expressionItem.target.textContent = Transform.transformObjectToString(Expression.executeExpression(expressionItem.expression, properties.__OG__.properties, expressionItem.refPropertyNames));
      })
    },
    clearElRefTree(target: Text & { [key: string]: any } & TElement): void {
      const ref = target.__OG__.ref;

      ref.propertyKeyMap.forEach((propertyItem, itemKey) => {
        const branch: TRefTree = Utils.getObjectProperty(target.__OG__.properties.__OG__.refTree, propertyItem);
        if (branch.__expressions) {
          branch.__expressions.delete(itemKey);
        }
      });
    }
  }
} as TModuleOptions
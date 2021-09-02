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
      const expressions: TExpressionItem[] = refTree.__expressions;

      expressions.forEach(expressionItem => {
        expressionItem.target.textContent = Transform.transformObjectToString(Expression.executeExpression(expressionItem.expression, properties.__OG__.properties, expressionItem.refPropertyNames));
      })
    },
    clearElRefTree(target: Text & { [key: string]: any } & TElement): void {
      const ref = target.__OG__.ref;
      ref.propertyNames.forEach(propertyNameArray => {
        const branch: TRefTree = Utils.getObjectProperty(target.__OG__.properties.__OG__.refTree, propertyNameArray);
        if (branch.__expressions) {
          branch.__expressions.forEach((expressItem, itemIndex) => {
            if (expressItem.target === target) {
              branch.__expressions.splice(itemIndex, 1);
            }
          });
        }
      });
    }
  }
} as TModuleOptions
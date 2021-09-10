import Module from "../../Module";
import { TElement } from "../../Typings/CustomElementTypings";
import { TExpressionItem } from "../../Typings/ExpressionTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import Expression from "../Expression";
import Transform from "../Transform";

export default {
  reactive: {
    setUpdateView(refTree: TRefTree, value: any, properties: TElement) {
      if (refTree?.__expressions === undefined) return;
      const expressions: Map<symbol, TExpressionItem> = refTree.__expressions;

      expressions.forEach(expressionItem => {
        if (expressionItem.target instanceof Attr) {
          Module.useAll("reactive.beforeUpdateAttrView", [expressionItem.target, expressionItem.target.nodeValue, properties, refTree]);
        }
        expressionItem.target.textContent = Transform.transformObjectToString(Expression.executeExpression(expressionItem.expression, properties.__OG__.properties, expressionItem.refPropertyNames)).toString();
        if (expressionItem.target instanceof Attr) {
          Module.useAll("reactive.afterUpdateAttrView", [expressionItem.target, expressionItem.target.nodeValue, properties, refTree]);
        }
      })
    }
  }
} as TModuleOptions
import { TElement, TReferrerElement } from "../../Typings/CustomElementTypings";
import { TExpressionItem } from "../../Typings/ExpressionTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Expression from "../Expression";
import Ref from "../Ref";
import Transform from "../Transform";

export default {
  reactive: {
    setUpdateView(refTree: TRefTree, properties: TElement) {
      if (refTree?.__expressions === undefined) return;
      const expressions: Map<symbol, TExpressionItem> = refTree.__expressions;

      expressions.forEach(expressionItem => {
        expressionItem.target.textContent = Transform.transformObjectToString(Expression.executeExpression(expressionItem.expression, properties.__OG__.properties, expressionItem.refPropertyNames));
      })
    }
  }
} as TModuleOptions
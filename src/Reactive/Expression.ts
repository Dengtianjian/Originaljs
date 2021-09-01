import { ICustomElement, IElement, TElement } from "../Typings/CustomElementTypings";
import { TExpressionItem } from "../Typings/ExpressionTypings";
import Ref from "./Ref";
import { RefRules } from "./Rules";
import Transform from "./Transform";

function executeExpression(expression: string, properties: IElement, refPropertyNames?: string[]): any {
  let expressionItem: TExpressionItem = null;
  if (refPropertyNames === undefined) {
    expressionItem = handleExpressionRef(expression, null);
    refPropertyNames = expressionItem.refPropertyNames;
  }
  let executeResult: any = new Function(`return ${expression}`).apply(properties);
  if (typeof executeResult === "function") {
    executeResult = executeResult.apply(properties);
  }

  return executeResult;
}

function handleExpressionRef(expression: string, target?: Text | Attr): TExpressionItem {
  expression = expression.match(RefRules.extractRefItem)[0].trim();
  const propertyNames: string[][] | string[] = Ref.collecRef(expression, false);
  propertyNames.forEach((propertyName, index) => {
    const matchValue:string=propertyName.replace(/([\[\]\.])/g,"\\$1");
    expression = expression.replace(new RegExp(`\{ *${matchValue} *\}`), `this.${propertyName}`);

    propertyNames[index] = Transform.transformPropertyNameToArray(propertyName);
  });

  return {
    expression,
    refPropertyNames: propertyNames as string[],
    target
  };
}

export default {
  executeExpression,
  handleExpressionRef
}
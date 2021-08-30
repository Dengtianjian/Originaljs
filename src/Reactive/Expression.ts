import { ICustomElement } from "../Typings/CustomElementTypings";

function executeExpression(expression: string, properties: ICustomElement): any {
  console.log(new Function(expression)());

  return "expression";
}

export default {
  executeExpression
}
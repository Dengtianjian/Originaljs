import { ICustomElement } from "../Typings/CustomElementTypings";
import Utils from "../Utils";
import Ref from "./Ref";
import { RefRules } from "./Rules";
import Transform from "./Transform";
const GlobalExtractVariableName: RegExp = new RegExp(RefRules.extractVariableName, "g");

function executeExpression(expression: string, properties: ICustomElement): any {
  expression = expression.trim();
  const refs: string[] = expression.match(GlobalExtractVariableName);
  const expressionData: Array<any> = [];
  let functionArguments: any[] = [];
  if (refs === null || refs.length === 0) {
    let expressionPropertyValue: any = Utils.getObjectProperty(properties, [expression]);
    if (typeof expressionPropertyValue === "function") {
      expression = "return " + expressionPropertyValue();
    } else {
      functionArguments.push(expression);
      expression = "return " + expression;
      expressionData.push(expressionPropertyValue);
    }
  } else {
    functionArguments.push(...refs);
    functionArguments = Array.from(new Set(functionArguments));
    refs.forEach(refItem => {
      let expressionPropertyValue: any = Utils.getObjectProperty(properties, Transform.transformPropertyNameToArray(refItem));
      if (typeof expressionPropertyValue === "function") {
        expressionPropertyValue = expressionPropertyValue();
      }
      expressionData.push(expressionPropertyValue);
    });
    expression = expression.replace(/\{ *([a-zA-z_][a-zA-z0-9_\.\[\]'"]+)? *\}/g, "$1");
    expression = "return " + expression;
  }

  let executeResult: unknown = new Function(...functionArguments, expression).apply(properties, expressionData);

  if (typeof executeResult === "function") {
    executeResult = executeResult();
  }

  return executeResult;
}

export default {
  executeExpression
}
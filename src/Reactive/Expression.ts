import { ICustomElement } from "../Typings/CustomElementTypings";
import { TExpressionInfo } from "../Typings/RefTypings";
import Ref from "./Ref";
import { RefRules } from "./Rules";

function generateExpressionInfo(expression: string): TExpressionInfo {
  const propertyKeys: string[][] = Ref.getRefPropertyKey(expression) as string[][];
  const extract: string[] = expression.match(/(?<=\{) *.+ *(?=\})/g);
  expression = extract[0].trim();
  expression = expression.replace(/\{ *([a-zA-z_][a-zA-z0-9_\.\[\]'"]+)? *\}/g, "this.$1");

  return {
    propertyKeys,
    expression
  }
}

function executeExpression(expressionInfo: TExpressionInfo, properties: ICustomElement): any {
  let executeResult: any = new Function(`return ${expressionInfo.expression}`).apply(properties);
  if (typeof executeResult === "function") {
    executeResult = executeResult.apply(properties);
  }

  return executeResult;
}

export default {
  executeExpression,
  generateExpressionInfo
}
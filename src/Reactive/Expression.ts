import { ICustomElement, IElement, TElement } from "../Typings/CustomElementTypings";
import { TExpressionItem } from "../Typings/ExpressionTypings";
import Ref from "./Ref";
import { RefRules } from "./Rules";
import Transform from "./Transform";

/**
 * 执行表达式
 * @param expression 表达式
 * @param properties 数据
 * @param refPropertyNames 引用的数据名称数组
 * @returns 表达式执行结果
 */
function executeExpression(expression: string, properties: IElement | Record<string, any>, refPropertyNames?: string[][]): any {
  let expressionItem: TExpressionItem = null;
  if (refPropertyNames === undefined) {
    expressionItem = handleExpressionRef(expression, null);
    if (!expressionItem) return "";
    expression = expressionItem.expression;
  }

  // TODO { count } { {count} + 2 } 会报错
  let executeResult: any = new Function(`return ${expression}`).apply(properties);
  if (typeof executeResult === "function") {
    executeResult = executeResult.apply(properties);
  }

  return executeResult;
}

/**
 * 解析处理表达式里含有的引用，返回target，是表达式宿主，expression，优化后的可执行表达式，refPropertyNames，表达式里含有的引用属性名称数组
 * @param expression 表达式
 * @param target 表达式宿主
 * @returns 表达式相关信息
 */
function handleExpressionRef(expression: string, target?: Text | Attr): TExpressionItem {
  const matchExpression: string[] = expression.match(RefRules.extractRefItem);
  if (!matchExpression) return;
  expression = matchExpression[0];
  const propertyNames: string[][] | string[] = Ref.collecRef(expression, false);
  propertyNames.forEach((propertyName, index) => {
    const matchValue: string = propertyName.replace(/([\[\]\.])/g, "\\$1");
    expression = expression.replace(new RegExp(`\{ *${matchValue} *\}`), `this.${propertyName}`);

    propertyNames[index] = Transform.transformPropertyNameToArray(propertyName);
  });

  return {
    expression,
    refPropertyNames: propertyNames as string[],
    target
  };
}

/**
 * 判断指定字符串是不是表达式
 * @param nowSureString 不确定的字符串
 * @returns 判断结果
 */
function isExpression(nowSureString: string): boolean {
  return RefRules.extractExpression.test(nowSureString);
}

export default {
  executeExpression,
  handleExpressionRef,
  isExpression
}
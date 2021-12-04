/**
 * 转换HTML文本为标签节点数组
 * @param HTMLString HTML文本
 * @returns 标签节点数组
 */
function parseDom(HTMLString: string): Node[] {
  const document: Document = new DOMParser().parseFromString(HTMLString, "text/html");

  return [
    ...Array.from(document.head.childNodes),
    ...Array.from(document.body.childNodes)
  ];
}

/**
 * 优化HTML模板字符串里的ref引用key，主要是为了解决在img标签src属性下带有 . 的引用，为编译完模板时会报url错误问题
 * @param sourceString HTML模板字符串
 * @returns 优化后的字符串
 */
function optimizeRefKey(sourceString: string): string {
  return sourceString.replaceAll(/(?<=\{[ \w_\.\[\]"']*)\.([\w_]+)/g, "['$1']");
}

const emptyConditions: string[] = ["{}", ""];
function filterEmptyValue(values: string[]): string[] {
  return values.filter(item => !emptyConditions.includes(item));
}
function parseTemplateGetExpression(template: string): {
  refs: string[],
  refsRaw: string[],
  expressions: string[],
  expressionsRaw: string[],
  executableExpressions: string[]
} {
  let charts: string[] = template.split("");
  const expressions: string[] = [];
  const expressionsRaw: string[] = [];
  const refs: string[] = [];
  const refsRaw: string[] = [];
  const executableExpressions: string[] = [];
  let inExpression: boolean = false;
  let inExpressionCount: number = 0;
  let inRef: boolean = false;
  let inRefCount: number = 0;
  let refKey: string = "";
  let refKeyRaw: string = "";
  let expression: string = "";
  let expressionRaw: string = "";
  let executableExpression: string = "";
  charts.forEach(chartItem => {
    switch (chartItem) {
      case "{":
        if (inExpression) {
          inRef = true;
          inRefCount++;

          refKey = "";
          refKeyRaw = "";
          refKeyRaw += chartItem;
          expressionRaw += chartItem;
          executableExpression += "this.";
        } else {
          inExpression = true;
          inExpressionCount++;
          expression = "";
          expressionRaw = "";
          expressionRaw += chartItem;
        }
        break;
      case "}":
        if (inExpression) {
          if (inRef) {
            inRefCount--;
            refs.push(refKey);
            refKey = "";
            refKeyRaw += chartItem;
            refsRaw.push(refKeyRaw);
            refKeyRaw = "";
            expressionRaw += chartItem;

            if (inRefCount === 0) {
              inRef = false;
            }
          } else {
            inExpressionCount--;
            expressionRaw += chartItem;
            expressionsRaw.push(expressionRaw);
            expressionRaw = "";
            executableExpressions.push(executableExpression);
            executableExpression = "";
            if (inExpressionCount === 0) {
              inExpression = false;
              expressions.push(expression);
              expression = "";
            }
          }
        } else {
          throw new Error("插值语法错误");
        }
        break;
      default:
        refKey += chartItem.trim();
        expression += chartItem.trim();
        refKeyRaw += chartItem;
        expressionRaw += chartItem;
        executableExpression += chartItem.trim();
        break;
    }
  });
  if (inExpressionCount > 0) {
    throw new Error("插值语法错误");
  }

  return {
    refs: filterEmptyValue(refs),
    refsRaw: filterEmptyValue(refsRaw),
    expressions: filterEmptyValue(expressions),
    expressionsRaw: filterEmptyValue(expressionsRaw),
    executableExpressions: filterEmptyValue(executableExpressions),
  };
}

export default {
  optimizeRefKey,
  parseDom,
  parseTemplateGetExpression
}
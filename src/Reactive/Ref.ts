import RegExpRules from "../RegExpRules";
import Parser from "./Parser";

type TExpressionInfo = {
  raw: string,
  value: string,
  refs: string[]
}

export default {
  collectExpression(template: string): TExpressionInfo[] {
    if (!template || RegExpRules.matchExpression.test(template) === false) return [];
    const marchExpressions: string[] = template.match(new RegExp(RegExpRules.matchExpression, "g"));
    const expressions: Array<TExpressionInfo> = [];
    marchExpressions.forEach((expression, index) => {
      const raw: string = expression;
      console.log(Parser.parseTemplateGetExpression(expression));
    });
    return expressions;
  },
  collectRefs(childNodes: Node[] | Node) {
    if (Array.isArray(childNodes) || childNodes instanceof NodeList) {
      childNodes.forEach(childNode => {
        this.collectRefs(childNode);
      });
      return;
    }
    if (childNodes instanceof Text === false) {
      if (childNodes.childNodes.length > 0) {
        this.collectRefs(childNodes.childNodes);
      }
      return;
    }

    console.log(childNodes.textContent);

    const expressions: TExpressionInfo[] = this.collectExpression(childNodes.textContent);

    // console.log(expressions);
  }
}
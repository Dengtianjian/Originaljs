import { parse, transformPropertyName } from "./Parser";
import { propertyHasKey } from "./reactive/Collect";
import { Ref } from "./Rules";
import { IEl, IOGElement } from "./types/ElementType";
import { IProperties } from "./types/Properties";
import { IRefTree } from "./types/Ref";
import Utils from "./Utils";

const matchVariableNameRegExp: RegExp = new RegExp(Ref.VariableName, "g");

export function executeExpression(expression: string, properties: IProperties): any {
  let variableNames: string[] = expression.match(matchVariableNameRegExp);
  if (variableNames === null) return;

  variableNames = Array.from(new Set(variableNames));
  const pushedNames: string[] = [];
  variableNames.forEach(name => {
    let firstPropertyName: string = transformPropertyName(name)[0];
    if (!pushedNames.includes(firstPropertyName) && propertyHasKey(name, properties)) {
      pushedNames.push(firstPropertyName);
    }
  });
  expression = parse(expression, properties, true);

  if (!expression) return null;
  const expressionProperties: IProperties = [];
  pushedNames.forEach(item => {
    expressionProperties.push(properties[item]);
  });
  pushedNames.push("return " + expression);

  return new Function(...pushedNames).apply(properties, expressionProperties);
}

export function generateExpressionRefTree(expressions: string[], target: IEl | Attr, rootEl: IOGElement): IRefTree {
  let refTree: IRefTree = {};

  if (expressions.length > 0) {
    for (const expressionItem of expressions) {
      const expressionItemString: string[] = expressionItem.match(/(?<=\{) *.+ *(?=\})/);

      let variableNames: string[] = expressionItem.match(matchVariableNameRegExp);
      if (variableNames === null) continue;
      variableNames = Array.from(new Set(variableNames));
      const pushedNames: string[] = [];
      variableNames.forEach(name => {
        let firstPropertyName: string = transformPropertyName(name)[0];
        if (!pushedNames.includes(firstPropertyName)) {
          pushedNames.push(firstPropertyName);
        }
      });
      const expressionProperties: IProperties = {};
      pushedNames.forEach(item => {
        expressionProperties[item] = rootEl[item];
      });

      const template: string = 'return ' + expressionItemString[0].trim();

      pushedNames.forEach(name => {
        Utils.objectAssign(refTree, Utils.generateObjectTree(transformPropertyName(name), {
          __expressions: [
            {
              propertyNames: variableNames,
              template,
              target,
              propertyFirstKeys: [...pushedNames, template]
            }
          ],
          __has: true
        }))
      })
    }
  }

  return refTree;
}
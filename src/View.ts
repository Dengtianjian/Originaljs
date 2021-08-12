import { executeExpression } from "./Expression";
import { parse, propertyNamesToPath, transformPropertyName, transformValueToString } from "./Parser";
import Plugin from "./Plugin";
import { getPropertyData } from "./Property";
import { TConditionElItem, TConditionItem } from "./types/ConditionElType";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr, TExpressionItem, TText } from "./types/Ref";
import Utils, { defineOGProperty } from "./Utils";

export function deepUpdateRef(refTree: IRefTree, refProperty?: IProperties): void {
  for (const propertyName in refTree) {
    if (!refProperty.hasOwnProperty(propertyName)) continue;

    let path: string = refProperty.__og__.propertiesPath;
    if (typeof refProperty[propertyName] === "object") {
      deepUpdateRef(refTree[propertyName], refProperty[propertyName]);
    } else {
      path = path ? `${path}.${propertyName}` : propertyName;
    }

    updateRef(refTree[propertyName], refProperty.__og__.properties, path);
  }
  return;
}

export function updateRef(refTree: IRefTree, properties: IProperties, propertyKeyPaths: string): void {
  if (!refTree) return;
  const els: TText[] = refTree.__els;
  const attrs: TAttr[] = refTree.__attrs;
  const expressions: TExpressionItem[] = refTree.__expressions;
  const conditions: TConditionItem[] = refTree.__conditions;

  Plugin.useAll("beforeUpdatedRef", Array.from(arguments));

  if (els && els.length > 0) {
    els.forEach(el => {
      if (el.__og__.parsed) {
        el.textContent = transformValueToString(getPropertyData(propertyKeyPaths, properties));
      } else {
        el.textContent = parse(el.textContent, properties);
        el.__og__.parsed = true;
      }
    })
  }

  if (attrs && attrs.length > 0) {
    for (const attr of attrs) {
      attr.nodeValue = parse(attr.__og__.attrs.nodeRawValue, properties);
    }
  }

  if (expressions && expressions.length > 0) {
    for (const expressionItem of expressions) {
      let expressionProperties: IProperties[] = [];
      let propertyFirstKeys: string[] = expressionItem.propertyFirstKeys;
      for (let index = 0; index < propertyFirstKeys.length - 1; index++) {
        expressionProperties.push(properties[propertyFirstKeys[index]]);
      }

      const functionResult: any = new Function(...expressionItem.propertyFirstKeys).apply(properties, expressionProperties);

      if (expressionItem.target instanceof Attr) {
        expressionItem.target.nodeValue = functionResult;
      } else {
        expressionItem.target.textContent = functionResult;
      }
    }
  }

  for (const key in conditions) {
    const conditionItem: TConditionItem = conditions[key];
    let els: TConditionElItem[] = conditionItem.els;

    for (let index = 0; index < els.length; index++) {
      const el = els[index];
      if (el.conditionAttr) {
        const expressionResult: any = executeExpression(el.conditionAttr.nodeValue, properties);
        if (expressionResult) {
          conditionItem.current = index;
          break;
        }
      }
    }

    if (conditionItem.current !== null) {
      let old: TConditionElItem = els[conditionItem.current];
      if (!old.substitute) old.substitute = new Comment();
    }

    for (let index = 0; index < els.length; index++) {
      const el = els[index];
      // if (conditionItem.current !== index) {
      //   if (el.substitute === null) {
      //     el.substitute = new Comment();
      //   }
      //   el.parentElement.appendChild(el.substitute);
      //   el.parentElement.removeChild(el.target);
      // } else {
      //   el.parentElement.removeChild(el.substitute);
      //   el.parentElement.append(el.target);
      // }
    }
  }

  Plugin.useAll("afterUpdatedRef", Array.from(arguments));
}

export function setUpdateView(target: any, propertyKey: string, value: any, receiver: any): boolean {
  const refTree: IRefTree = target.__og__.refTree;
  Plugin.useAll("dataUpdate", [target, propertyKey]);
  if (getPropertyData(propertyKey, target.__og__.properties) === value) {
    return true;
  }

  if (!target.__og__.propertiesPath) {
    target[propertyKey] = value;
    updateRef(refTree[propertyKey], target, propertyKey);
    return true;
  }
  const propertyNames: string[] = target.__og__.propertiesPath.split(".");
  const refTreePart: IRefTree = Utils.deepGetObjectProperty(refTree, propertyNames);

  Plugin.useAll("setUpdateView", [target, refTreePart, propertyKey, value]);

  return true;
}

export function deleteUpdateView(target: any, propertyKey: PropertyKey): boolean {
  Plugin.useAll("dataUpdate", [target, propertyKey]);
  Plugin.useAll("deleteUpdateView", [target, propertyKey]);
  return true;
}

export function removeRefTree(refTree: IRefTree, branchNames: string[], isDeep: boolean = false): boolean {
  if (refTree === undefined) return true;

  if (isDeep) {
    if (typeof refTree === "object") {
      for (const name in refTree) {
        if (refTree.hasOwnProperty(name) && name !== "__els" && name !== "__attrs") {
          branchNames.push(name);
          removeRefTree(refTree[name], branchNames, true);
          branchNames.pop();
        }
      }
    }
  }
  let attrs: TAttr[] = refTree['__attrs'];
  let els: TText[] = refTree['__els'];

  if (attrs && attrs.length > 0) {
    attrs.forEach(attr => {
      attr.__og__.attrs.nodeRawValue = attr.__og__.attrs.nodeRawValue.replace(`{${propertyNamesToPath(branchNames)}}`, "").trim();
    });
    refTree['__attrs'] = [];
  }
  if (els && els.length > 0) {
    els.forEach(el => {
      el.parentNode.removeChild(el);
    })
    refTree['__els'] = [];
  }

  return true;
}

export function removeTextRef(target: TText): void {
  if (!target.__og__?.ref) return;

  let branch = target.__og__.ref.branch;

  branch.__els.splice(branch.__els.indexOf(target), 1);
}
export function removeAttrRef(attr: TAttr): void {
  if (!attr.__og__?.ref) return;
  let branch = attr.__og__.ref.branch;

  branch.__attrs.splice(branch.__attrs.indexOf(attr), 1);
}
export function removeTargetRefTree(target: HTMLElement | Element, isDeep: boolean = false): void {
  if (isDeep && target.childNodes?.length > 0) {
    target.childNodes.forEach(nodeItem => {
      removeTargetRefTree(nodeItem, true);
    });
  }
  if (!target.__og__?.hasRef) return;

  target.childNodes.forEach(nodeItem => {
    if (nodeItem instanceof Text) {
      removeTextRef(nodeItem as TText);
    }
  });

  for (const attrItem of Array.from(target.attributes)) {
    removeAttrRef(attrItem);
  }

}
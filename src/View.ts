import { executeExpression } from "./Expression";
import { OGElement } from "./OGElement";
import { parse, propertyNamesToPath, transformPropertyName, transformValueToString } from "./Parser";
import Plugin from "./Plugin";
import { getPropertyData } from "./Property";
import { getRefs } from "./reactive/Collect";
import { TConditionElItem, TConditionItem } from "./types/ConditionElType";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr, TExpressionItem, TText } from "./types/Ref";
import Utils from "./Utils";

export function deepUpdateRef(refTree: IRefTree, refProperty?: IProperties): void {
  for (const branchName in refTree) {
    if (refProperty.hasOwnProperty(branchName) === false) continue;
    let branch: IRefTree = refTree[branchName];
    let branchProperty: IProperties = refProperty[branchName];

    if (branch.__has) {
      let path: string = "";
      if (typeof branchProperty !== "object") {
        let paths: string[] = transformPropertyName(refProperty.__og__.propertiesPath);
        paths.push(branchName);
        path = propertyNamesToPath(paths);
      } else {
        path = branchProperty.__og__.propertiesPath;
      }

      updateRef(branch, refProperty.__og__.properties, path);
    }

    if (typeof branchProperty === "object") {
      deepUpdateRef(branch, branchProperty);
    }
  }
}

export function updateRef(refTree: IRefTree, properties: IProperties, propertyKeyPaths: string): void {
  if (!refTree) return;
  const els: TText[] = refTree.__els;
  const attrs: TAttr[] = refTree.__attrs;
  const expressions: TExpressionItem[] = refTree.__expressions;
  const conditions: TConditionItem[] = refTree.__conditions;
  // TODO 更新数据 多次被调用

  Plugin.useAll("beforeUpdateRef", Array.from(arguments));

  for (const key in conditions) {
    const conditionItem: TConditionItem = conditions[key];
    let els: TConditionElItem[] = conditionItem.els;

    let newIndex: number = null;
    for (let index = 0; index < els.length; index++) {
      const el = els[index];
      if (["O-IF", "O-ELSE-IF"].includes(el.target.nodeName)) {
        const expressionResult: any = executeExpression(el.conditionAttr.__og__.attrs.nodeRawValue, properties);

        if (expressionResult) {
          newIndex = index;
          break;
        }
      } else {
        newIndex = index;
        break;
      }
      el.target.parentNode.insertBefore(el.substitute, el.target);
      el.target.parentNode.removeChild(el.target);
    }

    if (conditionItem.current === newIndex) continue;

    if (conditionItem.current !== null) {
      let currentShowEl = els[conditionItem.current];
      currentShowEl.parentElement.insertBefore(currentShowEl.substitute, currentShowEl.target);
      currentShowEl.parentElement.removeChild(currentShowEl.target);
    }

    let newShowEl = els[newIndex];
    if (newShowEl.parentElement.contains(newShowEl.substitute)) {
      newShowEl.parentElement.insertBefore(newShowEl.target, newShowEl.substitute);
      newShowEl.parentElement.removeChild(newShowEl.substitute);
    } else if (!newShowEl.parentElement.contains(newShowEl.target)) {
      newShowEl.parentElement.appendChild(newShowEl.target);
    }

    conditionItem.current = newIndex;
  }

  if (els && els.length > 0) {
    els.forEach(el => {
      Plugin.useAll("beforeUpdateElRef", [el, properties]);
      if (el.__og__.parsed) {
        el.textContent = transformValueToString(Utils.deepCopy(getPropertyData(propertyKeyPaths, properties)));
      } else {
        el.textContent = parse(el.textContent, properties);
        el.__og__.parsed = true;
      }
      Plugin.useAll("afterUpdateElRef", [el, properties]);
    })
  }

  if (attrs && attrs.length > 0) {
    for (const attr of attrs) {
      Plugin.useAll("beforeUpdateAttrRef", [attr, properties]);
      //* 判断是不是OG定义的元素，是的话再看是不是props
      if (attr.ownerElement instanceof OGElement) {
        let attrOwnerElement: OGElement = attr.ownerElement;

        if (attrOwnerElement.__og__.props.includes(attr.nodeName)) {
          let name = getRefs(attr.__og__.attrs.nodeRawValue)[0];
          let newValue = getPropertyData(name, properties);

          if (typeof newValue !== attr.nodeValue) attr.nodeValue = typeof newValue;

          attrOwnerElement.update(attr.nodeName, Utils.deepCopy(newValue));
        } else {
          attr.nodeValue = parse(attr.__og__.attrs.nodeRawValue, properties);
        }
      } else {
        attr.nodeValue = parse(attr.__og__.attrs.nodeRawValue, properties);
      }
      Plugin.useAll("afterUpdateAttrRef", [attr, properties]);
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
        if (expressionItem.target.ownerElement instanceof OGElement) {
          let atrrOwnerElement: OGElement = expressionItem.target.ownerElement;
          if (atrrOwnerElement.__og__.props.includes(expressionItem.target.nodeName)) {
            expressionItem.target.nodeValue = typeof functionResult;
            atrrOwnerElement.update(expressionItem.target.nodeName, functionResult);
          } else {
            expressionItem.target.nodeValue = functionResult;
          }
        } else {
          expressionItem.target.nodeValue = functionResult;
        }
      } else {
        expressionItem.target.textContent = functionResult;
      }
    }
  }

  Plugin.useAll("afterUpdateRef", Array.from(arguments));
}

export function setUpdateView(target: any, propertyKey: string, value: any, receiver: any): boolean {
  const refTree: IRefTree = target.__og__.refTree;
  Plugin.useAll("dataUpdate", [target, propertyKey]);

  if (!target.__og__.propertiesPath) {
    target[propertyKey] = value;
    updateRef(refTree[propertyKey], target, propertyKey);
    return true;
  }

  const propertyNames: string[] = transformPropertyName(target.__og__.propertiesPath);
  const refTreePart: IRefTree = Utils.deepGetObjectProperty(refTree, propertyNames);

  Plugin.useAll("setUpdateView", [target, refTreePart, propertyKey, value]);

  updateRef(refTreePart[propertyKey], target.__og__.properties, target.__og__.propertiesPath);
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
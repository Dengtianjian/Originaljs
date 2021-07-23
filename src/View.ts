import { parse, transformValueToString } from "./Parser";
import Plugin from "./Plugin";
import { getPropertyData } from "./Property";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr, TText } from "./types/Ref";
import Utils from "./Utils";

export function deepUpdateRef(refTree: IRefTree, properties: IProperties): void {
  for (const propertyName in refTree) {
    if (properties.hasOwnProperty(propertyName)) {
      const property = properties[propertyName];
      if (property === undefined || refTree[propertyName] === undefined || typeof property !== "object") continue;

      deepUpdateRef(refTree[propertyName], property);
      updateRef(refTree[propertyName], properties.__og__reactive.properties, property.__og__propertiesPath.split("."));
    }
  }
  return;
}

export function updateRef(refTree: IRefTree, properties: IProperties, propertyKeyPaths: string[]): void {
  if (!refTree) return;
  const els: TText[] = refTree.__els;
  const attrs: TAttr[] = refTree.__attrs;

  if (els && els.length > 0) {
    els.forEach(el => {
      if (el.__og__parsed) {
        el.textContent = transformValueToString(getPropertyData(propertyKeyPaths, properties));
      } else {
        el.textContent = parse(el.textContent, properties);
        el.__og__parsed = true;
      }
    })
  }

  if (attrs && attrs.length > 0) {
    for (const attr of attrs) {
      attr.nodeValue = parse(attr.__og__attrs.nodeRawValue, properties);
    }
  }
}

export function setUpdateView(target: any, propertyKey: string, value: any, receiver: any): boolean {
  const refTree: IRefTree = target.__og__reactive.refTree;
  if (!target.__og__propertiesPath) {
    target[propertyKey] = value;
    updateRef(refTree[propertyKey], target, propertyKey.split("."));
    return true;
  }
  const propertyNames: string[] = target.__og__propertiesPath.split(".");
  const refTreePart: IRefTree = Utils.deepGetObjectProperty(refTree, propertyNames);

  Plugin.useAll("setUpdateView", [target, refTreePart, propertyKey, value]);

  return true;
}

export function deleteUpdateView(target: any, propertyKey: PropertyKey): boolean {
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
      attr.__og__attrs.nodeRawValue = attr.__og__attrs.nodeRawValue.replace(`{${branchNames.join(".")}}`, "").trim();
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
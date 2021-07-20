import { parse, transformValueToString } from "./Parser";
import Plugin from "./Plugin";
import { getPropertyData } from "./Property";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr, TText } from "./types/Ref";
import Utils from "./Utils";

export function deepUpdateRef(refTree: IRefTree, properties: IProperties): void {
  for (const propertyName in refTree) {
    if (Object.prototype.hasOwnProperty.call(properties, propertyName)) {
      const property = properties[propertyName];
      if (property === undefined || refTree[propertyName] === undefined) continue;
      if (typeof property === "object") {
        deepUpdateRef(properties, property);
      }

      updateRef(refTree[propertyName], property.__og__reactive.properties, property.__og__propertiesPath);
    }
  }
  return;
}

export function updateRef(refTree: IRefTree, properties: IProperties, propertyKeyPaths: number | string | string[]): void {
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

export function setUpdateView(target: any, propertyKey: string | number, value: any, receiver: any): boolean {
  const refTree: IRefTree = target.__og__reactive.refTree;
  if (!target.__og__propertiesPath) {
    target[propertyKey] = value;
    updateRef(refTree[propertyKey], target, propertyKey);
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
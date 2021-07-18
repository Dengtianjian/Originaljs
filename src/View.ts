import { parse, transformPropertyName, transformValueToString } from "./Parser";
import { getPropertyData } from "./Property";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr, TText } from "./types/Ref";

export function updateRef(refTree: IRefTree, properties: IProperties, propertyKey: string): void {
  const els: TText[] = refTree[propertyKey].__els;
  const attrs: TAttr[] = refTree[propertyKey].__attrs;

  if (els && els.length > 0) {
    els.forEach(el => {
      if (el.__og__parsed) {
        el.textContent = transformValueToString(getPropertyData(propertyKey, properties));
      } else {
        el.textContent = parse(el.textContent, properties);
        Object.defineProperty(el, "__og__parsed", {
          value: true,
          configurable: false,
          writable: false,
          enumerable: false
        })
      }
    })
  }

  if (attrs && attrs.length > 0) {
    for (const attr of attrs) {
      attr.nodeValue = parse(attr.__og__attrs.nodeRawValue, properties);
    }
  }
}
import { parse } from "./Parser";
import { IProperties } from "./types/Properties";
import { IRefTree, TAttr } from "./types/Ref";

export function updateRef(refTree: IRefTree, properties: IProperties, branchName?: string): void {
  const els: Text[] = refTree[branchName].__els;
  const attrs: TAttr[] = refTree[branchName].__attrs;

  if (els && els.length > 0) {
    els.forEach(el => {
      el.textContent = parse(el.textContent, properties);
    })
  }

  if (attrs && attrs.length > 0) {
    for (const attr of attrs) {
      attr.nodeValue = parse(attr.__og__attrs.nodeRawValue, properties);
    }
  }
}
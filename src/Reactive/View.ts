import CustomElement from "../CustomElement";
import { TRefItem, TRefs } from "../Typings/RefType";
import Obj from "../Utils/Obj";
import Module from "./Module";
import For from "./Modules/For";
import Parser from "./Parser";
import PropertyProxy from "./PropertyProxy";
import Ref from "./Ref";
import Transform from "./Transform";

export default {
  executeStatement(statement: string, root: CustomElement): string {
    let result: any = null;
    try {
      result = new Function(`return ${statement}`).call(root);
      if (typeof result === "function") {
        result = result();
      }
    } catch (e) {
      console.log(statement);
      throw e;
    }

    return Transform.transformObjectToString(result).toString();
  },
  updateRefView(refs: TRefs, root: CustomElement) {
    for (const refKey in refs) {
      const refItem: TRefItem = refs[refKey];
      const refKeys: string[] = Transform.transformPropertyKey(refKey);
      const targetData: any = Obj.getObjectProperty(root, refKeys);
      Module.useAll("reflectAfter", [refItem, refKeys, targetData, targetData, root]);
    }
  },
  updateView(refItem: TRefItem, refKeys: string[], target: any, data: CustomElement) {
    Module.useAll("updateView", arguments);
  },
  render(template: string, rootEl: Element, root: CustomElement): Promise<void> {
    if (!template) return Promise.resolve();

    template = Parser.optimizeRefKey(template);
    const childNodes: Node[] = Parser.parseDom(template);
    const wrapperEl: HTMLElement = document.createElement("div");
    wrapperEl.append(...childNodes);
    For.inject(wrapperEl, root);
    const refs: TRefs = Ref.collectRefs(Array.from(wrapperEl.childNodes), root);
    console.log(wrapperEl);

    for (const refKey in refs) {
      const refItem: TRefItem = refs[refKey];
      const refKeys: string[] = Transform.transformPropertyKey(refKey);
      const targetData: any = Obj.getObjectProperty(root, refKeys);
      Module.useAll("reflectBefore", [refItem, refKeys, targetData, targetData, root]);
    }

    Ref.mergeRefs(root.__OG__.refs, refs);
    PropertyProxy.setProxyByRefs(refs, root);

    this.updateRefView(refs, root);

    rootEl.append(...Array.from(wrapperEl.childNodes));

    return Promise.resolve();
  }
}
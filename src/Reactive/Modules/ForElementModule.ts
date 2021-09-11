import { ICustomElement, IElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import Utils from "../../Utils";
import Err from "../../Utils/Err";

export default {
  reactive: {
    collecElRef(target: IElement, rootEl: ICustomElement): TRefTree {
      if (target.tagName !== "O-FOR") return {};
      if (!target.attributes['in']) {
        Err.throwError("For element requires in attribute");
      }
      const refTree: TRefTree = {};

      const attributes: NamedNodeMap = target.attributes;
      let itemName: string = !attributes[0] || attributes[0].nodeName === 'in' ? null : attributes[0].nodeName;
      let indexName: string = !attributes[1] || attributes[1].nodeName === 'in' ? null : attributes[1].nodeName;
      let keyName: string = !attributes[2] || attributes[2].nodeName === 'in' ? null : attributes[2].nodeName;
      const propertyName: string = attributes['in'].nodeValue;

      const forTemplate: string = target.innerHTML.trim();
      console.log(forTemplate);


      return refTree;
    }
  }
} as TModuleOptions
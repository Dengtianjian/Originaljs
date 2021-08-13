import Transition from "../../Transition";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";

export default {
  collectElRef(target: IEl, rootEl: IOGElement): IRefTree {
    if ((target as HTMLElement).tagName !== "O-TRANSITION") return {};
    let tag: HTMLElement = target as HTMLElement;
    if (!tag.attributes['name']) return {};
    let transitionName: string = tag.attributes['name'].nodeValue;
    let transition: Transition = rootEl.__og__.transitions[transitionName];

    const childrens: HTMLElement[] = Array.from(tag.children) as HTMLElement[];

    if (transition) {
      transition.els.push(...childrens);
      if (transition.updatePart === null) {
        transition.updatePart = childrens;
      } else {
        transition.updatePart.push(...childrens);
      }
    } else {
      rootEl.__og__.transitions[transitionName] = new Transition(childrens);
      rootEl.__og__.transitions[transitionName]['updatePart'] = childrens;
    }

    return {};
  },
  beforeUpdateRef(refTree: IRefTree): void {
    console.log(refTree);

  }
} as TPluginItem
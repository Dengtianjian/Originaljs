import Transition from "../../Transition";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";

export default {
  collectElRef(target: IEl, rootEl: IOGElement): IRefTree {
    if ((target as HTMLElement).tagName !== "O-TRANSITION") return {};
    let tag: HTMLElement = target as HTMLElement;
    if (!tag.attributes['name']) return {};
    let transitionName: string = tag.attributes['name'].nodeValue;
    let transition: Transition = rootEl.transitions[transitionName];

    const childrens: HTMLElement[] = Array.from(tag.children) as HTMLElement[];

    if (transition) {
      transition.els.push(...childrens);
      if (transition.updatePart === null) {
        transition.updatePart = childrens;
      } else {
        transition.updatePart.push(...childrens);
      }
    } else {
      rootEl.transitions[transitionName] = new Transition(childrens);
      rootEl.transitions[transitionName]['updatePart']=childrens;
    }

    return {};
  }
} as TPluginItem
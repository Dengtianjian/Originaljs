import Transition from "../../../Transition";
import { IEl, IOGElement } from "../../../types/ElementType";
import { TPluginItem } from "../../../types/Plugin";
import { IProperties } from "../../../types/Properties";
import { IRefTree } from "../../../types/Ref";

export default {
  el(target: IEl, rootEl: IOGElement): IRefTree {
    if ((target as HTMLElement).tagName !== "O-TRANSITION") return {};
    let tag: HTMLElement = target as HTMLElement;
    if (!tag.attributes['name']) return {};
    let transitionName: string = tag.attributes['name'].nodeValue;

    const childrens: HTMLElement[] = Array.from(tag.children) as HTMLElement[];
    const targetTransition: Transition = new Transition(childrens);
    rootEl.__og__transitions[transitionName] = targetTransition;

    return {};
  }
} as TPluginItem
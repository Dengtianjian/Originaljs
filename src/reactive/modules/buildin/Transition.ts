import Transition from "../../../Transition";
import { IEl } from "../../../types/ElementType";
import { TPluginItem } from "../../../types/Plugin";
import { IProperties } from "../../../types/Properties";
import { IRefTree } from "../../../types/Ref";

export default {
  el(target: IEl, properties: IProperties): IRefTree {
    if ((target as HTMLElement).tagName !== "O-TRANSITION") return {};
    let tag: HTMLElement = target as HTMLElement;
    if (!tag.attributes['function']) return {};
    let transitionFunctionName: string = tag.attributes['function'].nodeValue;
    if (!properties[transitionFunctionName]) return {};

    // @ts-ignore
    const targetTransition: Transition = new Transition(Array.from(tag.children));
    properties[transitionFunctionName](targetTransition)
    const mo: MutationObserver = new MutationObserver(() => {
      if (targetTransition.mutationDisabled) return;
      properties[transitionFunctionName](targetTransition, tag, ...arguments)
    });
    mo.observe(tag, {
      childList: false,
      attributes: true,
      subtree: false
    });

    return {};
  }
} as TPluginItem
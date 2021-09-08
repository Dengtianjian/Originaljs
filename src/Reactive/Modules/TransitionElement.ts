import Transition from "../../Transition";
import { ICustomElement, TElement, TReferrerElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import { ITransition } from "../../Typings/TransitionTypings";
import Ref from "../Ref";
import { RefRules } from "../Rules";

function addTransition(target: TElement, rootEl: ICustomElement) {
  if (target.tagName !== "O-TRANSITION") return {};
  if (!target.attributes['name']) {
    console.warn("Transition element is missing name attribute");
    return {};
  }
  const transitionName: string = target.attributes['name'].nodeValue;
  if (RefRules.refItem.test(transitionName)) return {};
  const transition: ITransition = rootEl.__OG__.transitions[transitionName];

  if (transition) {
    transition.els.add(target);
    if (!Array.isArray(transition.updatePart)) transition.updatePart = new Set();
    transition.updatePart.add(target);
  } else {
    rootEl.__OG__.transitions[transitionName] = new Transition();
    rootEl.__OG__.transitions[transitionName]['els'].add(target);
    rootEl.__OG__.transitions[transitionName]['updatePart'] = new Set();
    rootEl.__OG__.transitions[transitionName]['updatePart'].add(target);
  }
}

export default {
  reactive: {
    collecElRef(target: TElement, rootEl): TRefTree {
      addTransition(target, rootEl);
      return {};
    },
    beforeUpdateAttrView(attr: Attr, nodeValue: string, rootEl: TReferrerElement): void {
      if (attr.ownerElement === null || attr.ownerElement.tagName !== "O-TRANSITION") return;
      if (Ref.isRef(nodeValue)) return;
      let transitions = rootEl.__OG__.properties.__OG__.transitions;
      let transition: ITransition = transitions[nodeValue];
      if (!transitions[nodeValue]) return;
      transition.els.delete(attr.ownerElement as TElement);
      if (transition.updatePart !== null) {
        transition.updatePart.delete(attr.ownerElement as TElement);
      }
    },
    afterUpdateAttrView(attr: Attr, newValue: string, properties: TReferrerElement): void {
      if (attr.ownerElement === null || attr.ownerElement.tagName !== "O-TRANSITION") return;

      addTransition(attr.ownerElement as TElement, properties.__OG__.properties);
    }
  }
} as TModuleOptions
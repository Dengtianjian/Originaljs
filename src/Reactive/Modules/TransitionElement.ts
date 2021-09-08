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
    transition.els.push(target);
    if (!Array.isArray(transition.updatePart)) transition.updatePart = [];
    transition.updatePart.push(target);
  } else {
    rootEl.__OG__.transitions[transitionName] = new Transition();
    rootEl.__OG__.transitions[transitionName]['updatePart'] = [target];
    rootEl.__OG__.transitions[transitionName]['els'].push(target);
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
      transition.els.splice(transition.els.indexOf(attr.ownerElement as TElement), 1);
      if (transition.updatePart !== null) {
        transition.updatePart.splice(transition.updatePart.indexOf(attr.ownerElement as TElement), 1);
      }
    },
    afterUpdateAttrView(attr: Attr, newValue: string, properties: TReferrerElement): void {
      if (attr.ownerElement === null || attr.ownerElement.tagName !== "O-TRANSITION") return;

      addTransition(attr.ownerElement as TElement, properties.__OG__.properties);
    }
  }
} as TModuleOptions
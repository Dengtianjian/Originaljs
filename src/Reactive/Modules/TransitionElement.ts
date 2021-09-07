import Transition from "../../Transition";
import { TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import { ITransition } from "../../Typings/TransitionTypings";
import { RefRules } from "../Rules";

export default {
  reactive: {
    collecElRef(target: TElement, rootEl): TRefTree {
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
  }
} as TModuleOptions
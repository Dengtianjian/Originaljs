import Transition from "../../Transition";
import { TElement } from "../../Typings/CustomElementTypings";
import { TModuleOptions } from "../../Typings/ModuleTypings";
import { TRefTree } from "../../Typings/RefTypings";
import { ITransition } from "../../Typings/TransitionTypings";
import Utils from "../../Utils";

export default {
  reactive: {
    collecElRef(target: TElement, rootEl): TRefTree {
      if (target.tagName !== "O-TRANSITION") return {};
      if (!target.attributes['name']) {
        console.warn("Transition element is missing name attribute");
        return {};
      }

      const transitionName: string = target.attributes['name'].nodeValue;
      const transition: Transition = rootEl.__OG__.transitions[transitionName];

      if(transition){

      }else{

      }


      return {};
    }
  }
} as TModuleOptions
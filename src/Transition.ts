import { TElement } from "./Typings/CustomElementTypings";
import { ITransition, TTransitionItem } from "./Typings/TransitionTypings";

export default class Transition implements ITransition {
  els: TElement[] = [];
  updatePart: TElement[] = [];
  transitions: TTransitionItem[] = [];
  step() {
    return this;
  }
  end() {
    return this;
  }
  clear() {
    return this;
  }
  continue() {
    return this;
  }
  stop() {
    return this;
  }
}
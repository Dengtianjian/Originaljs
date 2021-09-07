import { ITransition } from "./Typings/TransitionTypings";

export default class Transition implements ITransition {
  updatePart = [];
  step() {
    return this;
  }
  end() {
    return this;
  }
  clear() {
    return this;
  }
}
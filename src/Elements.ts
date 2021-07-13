import { Element } from "./element";
import { IElement } from "./types/ElementType";

export function createElement(props: string[] = []) {
  return class extends Element {
    static observedAttributes: string[] = props;
    _Props: string[] = props;
    constructor() {
      super();
    }
  }
}

export default {
  createElement
}
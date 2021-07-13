import { Element } from "./element";
import { IElement } from "./types/ElementType";

function createElement(props: string[]) {
  return class extends Element implements IElement {
    static observedAttributes: string[] = props;
    _OGElement: boolean = true;
    _Props: string[] = props;
    constructor() {
      super();
    }
  }
}

export default {
  createElement
}
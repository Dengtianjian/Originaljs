import { OGElement } from "./OGElement";

export function createElement(props: string[] = []) {
  return class extends OGElement {
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
import Parser from "./Reactive/Parser";
import PropertyProxy from "./Reactive/PropertyProxy";
import Ref from "./Reactive/Ref";
import View from "./Reactive/View";
import { TRefs } from "./Typings/RefType";

interface ICustomElement {
  __OG__: {
    rootEl: HTMLElement | ShadowRoot;
    props: string[];
    refs: TRefs
  };
}

export default class extends HTMLElement implements ICustomElement {
  constructor(props: string[] = []) {
    super();
    this.__OG__.rootEl = this.attachShadow({
      mode: "closed",
    });
    this.__OG__.props = props;
  }
  __OG__ = {
    rootEl: null,
    props: [],
    refs: {}
  };
  render(template: string): Promise<void> {
    return View.render(template, this.__OG__.rootEl, this);
  }
}

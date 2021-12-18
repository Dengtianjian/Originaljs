import Parser from "./Reactive/Parser";
import PropertyProxy from "./Reactive/PropertyProxy";
import Ref from "./Reactive/Ref";
import View from "./Reactive/View";
import { TRefs } from "./Typings/RefType";

interface ICustomElement {
  __OG__: {
    rootEl: HTMLElement;
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
  render(template: string) {
    template = Parser.optimizeRefKey(template);
    const childNodes: Node[] = Parser.parseDom(template);
    const wrapperEl: HTMLElement = document.createElement("div");
    wrapperEl.append(...childNodes);
    const refs: TRefs = Ref.collectRefs(wrapperEl);

    this.__OG__.refs = refs;
    PropertyProxy.setProxy(refs, this);
    console.dir(this);
    View.updateRefView(refs, this);

    this.__OG__.rootEl.append(...Array.from(wrapperEl.childNodes));
  }
}

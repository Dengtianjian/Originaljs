import Parser from "./Reactive/Parser";
import Ref from "./Reactive/Ref";
import View from "./Reactive/View";

interface ICustomElement {
  __OG__: {
    rootEl: HTMLElement;
    props: string[];
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
  };
  render(template: string) {
    template = Parser.optimizeRefKey(template);
    const childNodes: Node[] = Parser.parseDom(template);
    const wrapperEl: HTMLElement = document.createElement("div");
    wrapperEl.append(...childNodes);
    const refTree = Ref.collectRefs(wrapperEl);
    // console.log(refTree);
    View.updateRefView(refTree, this);

    this.__OG__.rootEl.append(...Array.from(wrapperEl.childNodes));
  }
}

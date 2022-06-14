import CustomElement from "./CustomElement";

/**
 * 创建自定义元素
 * @param props 向外提供的props
 * @returns CustomElement
 */
function createElement(props: string[] = []) {
  return class extends CustomElement {
    static observedAttributes: string[] = props;
    constructor() {
      super(props);
    }
  }
}

/**
 * 定义标签
 * @param name 定义的标签名称，必须要加上 - 符号，用于和原生元素区分
 * @param constructor 自定义标签的类
 * @param options 自定义标签的选项，同window.customElements.define传入的options选项一样
 */
function defineElement(name: string, constructor: CustomElementConstructor, options: ElementDefinitionOptions = {}): void {
  window.customElements.define(name, constructor, options);
}

export default {
  createElement,
  defineElement
}
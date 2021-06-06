import {
  IMethodObject,
  IElement,
  TProps,
  TProp,
  TPropValueFunction,
} from "../types/elementType";

export class Element extends HTMLElement implements IElement {
  protected $ref: Element | ShadowRoot | null = null;
  protected $template: string = "";
  protected static $propsRaw: TProps = {};
  protected static $propKeys: string[] = [];
  props: TProps = {};
  private $methods: IMethodObject = {};
  methods: IMethodObject | {} = {};
  static observedAttributes = [];
  constructor() {
    super();
  }
  protected async reader() {
    this.$ref.innerHTML = this.$template;
  }
  connected() {}
  disconnected() {}
  adoptied() {}
  propChanged(name: string, oldV: string, newV: string) {}
  private connectedCallback() {
    this.bindMethods();
    this.queryPropsEl();
    this.connected();
  }
  private disconnectedCallback() {
    this.disconnected();
  }
  private adoptedCallback() {
    console.log("adopted");

    this.adoptied();
  }
  private attributeChangedCallback(name: string, oldV: string, newV: string) {
    this.props[name]["value"] = newV;
    this.handleProps(name, newV, oldV);
    this.propChanged(name, newV, oldV);
  }
  protected bindMethods() {
    Object.assign(this.$methods, this.methods);
    for (const methodKey in this.$methods) {
      if (Object.hasOwnProperty.call(this.$methods, methodKey)) {
        const methodItem = this.$methods[methodKey];

        if (typeof methodItem === "function") {
          methodItem.call(this, this.$ref.querySelector(methodKey));
        } else {
          let selector = methodKey;
          if (methodItem.hasOwnProperty("selector")) {
            selector = methodItem["selector"];
          }
          this.$ref.querySelector(selector).addEventListener(
            methodItem.type,
            (event) => {
              methodItem.listener.call(
                this,
                event,
                this.$ref.querySelector(selector)
              );
            },
            methodItem.options || {}
          );
        }
      }
    }
  }
  protected queryPropsEl() {
    for (const propName in this.props) {
      if (Object.prototype.hasOwnProperty.call(this.props, propName)) {
        const prop: TProp | TPropValueFunction = this.props[propName];
        if (typeof prop !== "function") {
          if (prop["selector"]) {
            prop["el"] = this.$ref.querySelector(prop["selector"]);
          } else {
            prop["el"] = this.$ref.querySelector(propName);
          }
        }
        this.handleProps(propName, prop["value"] || null);
      }
    }
  }
  protected handleProps(
    name: string,
    newV: string | boolean | number | null,
    oldV?: string
  ) {
    const prop: TProp | TPropValueFunction = this.props[name];
    if (typeof prop === "function") {
      prop.call(this.$ref, newV, oldV, name);
    } else {
      if (prop["selector"]) {
        prop["el"] = this.$ref.querySelector(prop["selector"]);
      } else {
        prop["el"] = this.$ref;
      }

      if (prop["attribute"]) {
        switch (prop["attribute"]) {
          case "className":
            let classList = Array.from(prop["el"]["classList"]);
            let className = prop["el"]["className"];
            className = String(className).trim();
            if (!classList.includes(String(newV))) {
              prop["el"]["className"] += " " + newV;
            }
            if (!newV && oldV) {
              prop["el"]["className"] = className.replace(
                new RegExp(`${oldV}\s?`),
                ""
              );
            }
            prop["value"] = newV;
            break;
          case "style":
            prop["el"]["style"][name] = newV;
            break;
          default:
            prop["el"][prop["attribute"]] = newV;
            break;
        }
      }
      if (typeof prop["observer"] === "function") {
        prop["observer"].call(
          prop["el"],
          newV ? newV : prop["value"],
          oldV,
          name
        );
      }
    }
  }
}

export function createComponent(props: TProps = {}, template: string = "") {
  return class extends Element {
    $template: string = template;
    $propsRaw: TProps = props;
    $propKeys: string[] = Object.keys(props);
    props: TProps = props;
    static observedAttributes: string[] = Object.keys(props);
    methods: IMethodObject = {};
    constructor() {
      super();
      this.$ref = this.attachShadow({
        mode: "closed",
      });
      this.reader();
    }
  };
}

export default createComponent;

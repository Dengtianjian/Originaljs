import {
  IMethodObject,
  IElement,
  TProps,
  TProp,
  TPropValueFunction,
} from "../types/elementType";
export namespace oldElement {
  export class Element extends HTMLElement implements IElement {
    $target = this;
    protected $ref: Element | ShadowRoot | null = null;
    protected $template: string = "";
    $propsRaw: TProps = {};
    protected static $propsRaw: TProps = {};
    protected static $propKeys: string[] = [];
    props: TProps = {};
    private $methods: IMethodObject = {};
    methods: IMethodObject | {} = {};
    static observedAttributes = [];
    constructor() {
      super();
    }
    protected nodeBindMethods(nodes) {
      nodes.forEach((node, key) => {
        if (node.childNodes.length > 0) {
          this.nodeBindMethods(node.childNodes);
        }

        // @ts-ignore
        if (node.attributes && node.attributes.length > 0) {
          // @ts-ignore
          for (const attributeItem of node.attributes) {
            if (
              /^on[a-z]+$/.test(attributeItem.name) &&
              /^\w+(\(\))?/.test(attributeItem.value)
            ) {
              let paramsRaw = String(attributeItem.value).match(
                /(?<=\().+(?=\))/
              );
              let params = [];
              if (paramsRaw !== null) {
                params = paramsRaw[0].split(",");
              }
              // let eventName = String(attributeItem.name).match(/(?<=on)\w+$/);
              let methodName = String(attributeItem.value).match(
                /\w+(?=\(.+\))?/
              );

              // node.addEventListener(
              //   eventName[0],
              //   this[methodName[0]].bind(this, ...params)
              // );

              node[attributeItem.name] = (event) => {
                event["$target"] = node;

                if (paramsRaw && params.length > 0) {
                  params.forEach((param, index) => {
                    if (/\$event/.test(param)) {
                      params[index] = event;
                    }
                    if (/\$target/.test(param)) {
                      params[index] = node;
                    }
                  });
                }
                if (paramsRaw) {
                  this[methodName[0]].bind(this)(...params);
                } else {
                  this[methodName[0]].bind(this)(event);
                }
              };
            }
          }
        }
      });
      return nodes;
    }
    protected async reader() {
      let appendChilds = [];
      if (typeof this.$template === "string") {
        const document = new DOMParser().parseFromString(
          this.$template,
          "text/html"
        );
        const headChildNodes = document.childNodes[0].childNodes[0].childNodes;
        const bodyChildNodes = document.childNodes[0].childNodes[1].childNodes;
        appendChilds = [
          ...Array.from(headChildNodes),
          ...Array.from(bodyChildNodes),
        ];
      } else {
        appendChilds = [this.$template];
      }

      // this.replaceVar();
      this.nodeBindMethods(appendChilds).forEach((node, key) => {
        this.$ref.appendChild(node);
      });

      // this.bindMethods();
      this.queryPropsEl();
    }
    connected() { }
    disconnected() { }
    adoptied() { }
    propChanged(name: string, oldV: string, newV: string) { }
    data(): object {
      return {};
    }
    addDataToProperty() {
      const data = this.data();
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const element = data[key];
          this[`$${key}`] = data[key];
        }
      }
    }
    private connectedCallback() {
      this.addDataToProperty();
      this.connected();
    }
    private disconnectedCallback() {
      this.disconnected();
    }
    private adoptedCallback() {
      this.adoptied();
    }
    private attributeChangedCallback(name: string, oldV: string, newV: string) {
      this.props[name]["value"] = newV;
      this.handleProps(name, newV, oldV);
      this.propChanged(name, newV, oldV);
    }
    //! 待废弃
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
    replaceVar() {
      const vars =
        this.$template.match(/(?<=\{).+?(?=\})/g);
      if (vars === null) {
        return;
      }

      vars.forEach((varItem) => {
        let prop = this.$propsRaw[varItem];
        let replaceVal;
        if (typeof prop === "function") {
          replaceVal = replaceVal();
        }

        this.$template.innerHTML =
          this.$template.innerHTML.replace(
            `\{${varItem}\}`,
            String(this.$num)
          );
      });
    }
  }

  export function createComponent(
    props: TProps = {},
    template: string | keyof HTMLElementTagNameMap = ""
  ) {
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

}
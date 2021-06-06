import createComponent from "../runtime/element";
import { importTemplate, ObserverNodeAttributes } from "../runtime/index";
import Transition from "../runtime/transition";
import { IMethodObject } from "../types/elementType";

const props = {
  title: {
    selector: ".c-dialog-title",
    attribute: "innerText",
    value: "AAA",
  },
  width: {
    selector: ".c-dialog",
    attribute: "style",
    value: "80vw",
  },
  height: {
    selector: ".c-dialog",
    attribute: "style",
    value: "60vh",
  },
  zIndex: {
    selector: ".c-dialog",
    attribute: "style",
    value: "2",
  },
};

let template: string = await importTemplate("../template/CDialog.html");

export default class extends createComponent(props, template) {
  constructor() {
    super();
    ObserverNodeAttributes(this, "hidden", () => {
      this.show();
    });
  }
  show() {
    const dialogT = new Transition();
    const overlayT = new Transition();
    overlayT
      .el("c-overlay", this.$ref)
      .step(
        {
          opacity: 0,
        },
        0.1
      )
      .step(
        {
          opacity: 1,
        },
        0.2
      );
    dialogT
      .el(".c-dialog", this.$ref)
      .step(
        {
          transform: "translateY(-40px)",
          opacity: 0,
        },
        0.1
      )
      .step(
        {
          transform: "translateY(0px)",
          opacity: "1",
        },
        0.2
      )
      .clear();
  }
  hide() {
    const dialogT = new Transition();
    const overlayT = new Transition();
    dialogT
      .el(".c-dialog", this.$ref)
      .step({
        transform: "translateY(-40px)",
        opacity: "0.2",
      })
      .clear();
    overlayT
      .el("c-overlay", this.$ref)
      .step(
        {
          opacity: 0,
        },
        0.25
      )
      .clear()
      .end(() => {
        this.hidden = true;
      });
  }
  methods: IMethodObject = {
    ".c-dialog-close": {
      type: "click",
      listener(event, el) {
        this.hide();
        if (typeof this.closed === "function") {
          this.closed();
        }
      },
    },
    "c-overlay": {
      type: "click",
      listener(event, el) {
        this.hide();
      },
    },
  };
}

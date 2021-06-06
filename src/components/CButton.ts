import { importTemplate } from "../runtime";
import createComponent from "../runtime/element";
import { IMethodObject } from "../types/elementType";

let template: string = await importTemplate("../template/CButton.html");

export default class extends createComponent(
  {
    type: {
      selector: "button",
      value: "",
      observer(value) {
        if (!value) {
          this.className = "c-button c-button_normal";
        } else {
          this.className = "c-button c-button_" + value;
        }
      },
    },
    plain(value) {
      this.querySelector("button").className += " c-button_plain";
      if (value !== "false") {
        this.querySelector("button").className += " c-button_plain";
      }
    },
  },
  template
) {
  constructor() {
    super();
  }
  methods: IMethodObject = {
    close: {
      selector: "button",
      type: "click",
      listener() {
        console.log(1);
      },
    },
  };
}

import {
  createComponent,
  defineComponent,
  importTemplate,
  Query,
} from "./runtime";

// let template: string = await import("./components/templates/cbutton.html");
// template = template.default;

let template = Query(".c-button");

class CButton extends createComponent({}, template) {
  constructor() {
    super();
  }
  show(a, b, c) {
    console.log(a, b, c);
  }
  startMove() {
    alert(this.dataset.date);
  }
}

defineComponent("c-button", CButton);

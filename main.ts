import OG, { defineElement } from "./src";

let template: string = `
<div onclick="show">
  2222222
  <div onclick="show;dialog;hide">
  Template
  <slot />
  </div>
</div>
`;

class CButton extends OG.createElement() {
  show(target, event: MouseEvent) {
    event.stopPropagation();
    console.log("show");
  }
  dialog(target, event) {
    console.log(event);
  }
  hide(target, event) {
    console.log(target, event);
  }
  render() {
    return template;
  }
}

defineElement("c-button", CButton);
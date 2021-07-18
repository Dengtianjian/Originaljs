import OG, { defineElement } from "./src";

let template: string = `
<div data-number="{number}">
A{ number }B
</div>
`;

class CButton extends OG.createElement() {
  number = 123;
  render() {
    return template;
  }
}

defineElement("c-button", CButton);
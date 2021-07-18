import OG, { defineElement } from "./src";

let template: string = `
<div data-number="{number}">
A{ number }B {obj}
</div>
`;

class CButton extends OG.createElement() {
  number = 123;
  obj = {
    name: 2,
    nums: [0, 1, 2, 3, 4]
  }
  render() {
    return template;
  }
}

defineElement("c-button", CButton);
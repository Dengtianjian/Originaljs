import {
  createComponent,
  defineComponent,
  importTemplate,
  Query,
} from "./runtime";
import ElementSpace from "./runtime/elements";

// let template: string = await import("./components/templates/cbutton.html");
// template = template.default;

// let template = Query("#CButton").content.cloneNode(true);

let template: string = `<style>
button {
    padding: 5px;
    border: none;
    cursor: pointer;
  }
  button:hover {
    color: white;
    background-color: blueviolet;
  }
</style>
<button onclick="show" title="aaa" data-date="2021">
  <slot></slot>
  {num}
</button>`;

class CButton extends ElementSpace.Element {
  constructor() {
    super(template);
  }
  state = {
    name: "admin",
    num: [Date.now(), 1, 3]
  };
  show() {
    console.log(this);

    console.log(1);
  }
  startMove() {
    alert(this.dataset.date);
  }
}

function component(el, newAttr = {}) {
  console.log(newAttr);

  window.onload = function () {
    el.$target.show = newAttr.show;
  };
}
// component(Query(".save-button"), {
//   show() {
//     console.log(2);
//   },
//   $num: "abc",
// });
defineComponent("c-button", CButton);

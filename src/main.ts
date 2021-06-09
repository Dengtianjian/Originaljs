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
<button title="aaa" data-date="2021" onclick="show">
  <slot></slot>
  {num}
  <span onclick="startMove">&nbsp;{num}</span>
</button>`;

class CButton extends ElementSpace.Element {
  constructor() {
    super(template);
  }
  show() {
    console.log(1);
  }
  startMove(event) {
    // event.stopPropagation();
    console.log(event);
  }
  num = [Date.now(), 1, 3];
}

Query(".save-button").onclick = function () {
  this.setState("num", Date.now());
};

defineComponent("c-button", CButton);

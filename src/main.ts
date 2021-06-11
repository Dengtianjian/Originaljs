import {
  defineComponent,
  importTemplate,
  Query,
  Element
} from "./runtime";

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
<button title="aaa" data-date="2021">
  <slot></slot>
  {num}
  <span onclick="startMove;moving(666,'aa','{num}');endMove" >&nbsp;{num}</span>
  <div style="margin-top:20px;width:200px">
    123456
    <div onclick="show;endMove"  >
      moving
    </div>
  </div>
</button>`;

class CButton extends Element {
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
  moving(p) {
    console.log(p);
  }
  endMove() {
    console.log(this);
  }
  num = [Date.now(), 1, 3];
}

Query(".save-button").addEventListener("click", function () {
  const now = Date.now();
  this.setState("num", async (event) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(Math.round(Math.random() * 10000));
      })
    })
  });
});

defineComponent("c-button", CButton);

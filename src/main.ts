import {
  defineElement,
  importTemplate,
  Query,
  Element,
  createElement
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
  .c-button_primary {
    color:white;
    transition:0.2s linear all;
    background-color:blueviolet;
  }
  .c-button_primary:hover {
    background-color:#6b21af;
  }
</style>
<button class="{_className}" title="aaa" data-date="2021" data-a={showEl} style="position:{position};">
  <slot></slot>
  {num}
  <span onclick="startMove;moving('moving','aa','{num}');endMove" >&nbsp;{num}</span>
  <div style="margin-top:20px;width:200px">
    {nums}
    <div onclick="show;endMove('{position}')" onmouseenter="show"  >
      moving
    </div>
  </div>
</button>`;

class CButton extends createElement({
  name: "666"
}) {
  constructor() {
    super();
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
  endMove(position) {
    console.log(position);
  }
  render() {
    return template;
  }
  num = [Date.now(), 1, 3];
  nums = 888;
  _className: string = "c-button";
  position: string = "relative";
  showEl: number = 2;
  set type(val) {
    // this.setState("_className", this._className += " c-button-" + val);
  }
  get type() {
    return "";
  }
}

Query(".save-button").addEventListener("click", function () {
  this.setState("position", "fixed");
});

defineElement("c-button", CButton);

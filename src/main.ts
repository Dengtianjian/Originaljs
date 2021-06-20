import {
  defineElement,
  createElement,
  Reactive
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
  <span onclick="startMove;moving('moving','aa','{showEl}');endMove" >&nbsp;{name}</span>
  <div style="margin-top:20px;width:200px">
  {obj.a}
  {nums[1].a}
    <div onclick="show;endMove('{position}')" onmouseenter="show"  >
    {name}
    </div>
  </div>
</button>`;
template = `
<button onclick="updateArr" data-nums="{nums}">Update arr</button>
<o-for dataitem in nums>
{dataitem}
</o-for>`

class CButton extends createElement(["name"]) {
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

  nums = [1];
  numarr = [[123, 456], ["456"]];
  users = [{
    name: "admin"
  }];
  updateArr(event) {
    // console.log(event);

    this.nums.push(Math.round(Math.random() * 1000));
  }
}


defineElement("c-button", CButton);

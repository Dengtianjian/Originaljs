import { createComponent, defineComponent, importTemplate } from "./runtime";

let template: string = `
<style>
button {
  padding:5px;
  border:none;
  cursor:pointer;
}
button:hover {
  color:white;
  background-color:red;
}
</style>
<button onclick="show" title="aaa" data-date="2021" >
<slot />
</button>
<button title="aaa" onclick="startMove" data-date="3333" >
2
</button>
`;

template = await importTemplate("./components/template/cbutton.html");

class CButton extends createComponent({}, template) {
  constructor() {
    super();
  }
  show() {
    alert(this.dataset.date);
  }
  startMove() {
    alert(this.dataset.date);
  }
}

defineComponent("c-button", CButton);

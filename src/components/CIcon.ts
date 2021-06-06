import { importTemplate } from "../runtime";
import createComponent from "../runtime/element";

const props = {
  value: {
    selector: "i",
    attribute: "className",
    value: "",
  },
  font: {
    selector: "i",
    attribute: "className",
    value: "iconfont",
  },
};

const template = await importTemplate("../template/CIcon.html");

export default class CIcon extends createComponent(props, template) {}

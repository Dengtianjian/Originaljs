import createComponent from "../runtime/element";
import { importTemplate } from "../runtime/index";

let template: string = await importTemplate("../template/COverlay.html");

export default class COverlay extends createComponent(
  {
    zIndex: {
      selector: ".c-overlay",
      attribute: "style",
      value: "1",
    },
  },
  template
) {}

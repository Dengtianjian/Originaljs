import OG from "./src";

let CElTemplate: string = await fetch("./cel.html").then(res => res.text());
import Utils from "./src/Utils";

class CEl extends OG.createElement() {
  constructor() {
    super();
    console.time("render");
    this.render(CElTemplate).then(res => {
      console.timeEnd("render");
    })
  }
  rendered() {
    console.timeLog("render");
  }
  msg = "Hello world";
  user = {
    name: "admin"
  };
  obj = {
    a: {
      c: 8
    }
  }
}


OG.defineElement("c-el", CEl);
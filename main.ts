import OG from "./src";

let CElTemplate: string = await fetch("./cel.html").then(res => res.text());

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
}

OG.defineElement("c-el", CEl);
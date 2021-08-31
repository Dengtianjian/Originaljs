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
    // setInterval(() => {
    //   this.user.name = this.formatTime();
    // }, 1000);
    setTimeout(() => {
      this.display.show = true;
    }, 5000);
    // setInterval(() => {
    //   this.obj.a = {
    //     c: Date.now()
    //   }
    // }, 1000);
  }
  msg = "Hello world";
  user = {
    name: "admin"
  };
  obj = {
    a: {
      c: 8
    }
  };
  count = 888;
  display = {
    show: false
  };
  async computed() {
    return new Promise((resolve, reject) => {
      resolve(1);
      setTimeout(() => {
        reject({
          message: "error"
        });
      }, 5000);
    })
  }
  datePatchZero(dateEl: number | string): string | number {
    return dateEl < 10 ? `0${dateEl}` : dateEl;
  }
  formatTime(): string {
    let timeString: string = "";
    let d: Date = new Date();
    timeString = `${d.getFullYear()}-${this.datePatchZero(d.getMonth() + 1)}-${this.datePatchZero(d.getDate())} ${this.datePatchZero(d.getHours())}:${this.datePatchZero(d.getMinutes())}:${this.datePatchZero(d.getSeconds())}`;

    return timeString;
  }
}


OG.defineElement("c-el", CEl);
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
    // setTimeout(() => {
    //   this.user.name = "https://wx1.sinaimg.cn/orj360/002TLsr9ly1gu0usvnavsj61hc0o011o02.jpg";
    //   setTimeout(() => {
    //     this.user.name = "https://mbdp01.bdstatic.com/static/landing-pc/img/logo_top.79fdb8c2.png";
    //   }, 5000);
    // }, 5000);
    // setInterval(() => {
    //   this.obj.a = {
    //     c: Date.now()
    //   }
    // }, 1000);
  }
  msg = "Hello world";
  user = {
    name: "https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/dcec27cc6ece0eb5bb217e62e6bec104.svg"
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
  updateData = () => {
    this.display.show = !this.display.show;
  }
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
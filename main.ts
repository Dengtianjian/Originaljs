import OG from "./src";
OG.transitionPreset("fadeHide").add({
  opacity: "0",
  transitionDuration: "0.3s"
}).add({
  opacity: "1",
  transitionDuration: "0.3s"
});

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
    // setTimeout(() => {
    //   this.obj.a.c = 2;
    // }, 5000);
    // setInterval(() => {
    //   this.obj.a.c = this.formatTime();
    // }, 1000);
    // setInterval(() => {
    //   this.users.push({
    //     id: Date.now()
    //   })
    // }, 1000);
    setTimeout(() => {
      this.users.unshift(...[
        {
          id: 8
        }, {
          id: 9
        }, {
          id: 10
        }
      ])
    }, 2000);
    // setTimeout(() => {
    //   this.users.push({
    //     id: Date.now()
    //   })
    // }, 1000);
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
    show: false,
    number: 1,
    tagName: "o-table",
    staticHtml: `<p>{msg}</p>`,
    staticHTML2: "<h1>Hello static HTML2</h1>"
  };
  show = false;
  transitionStop = null;
  updateNumber(number) {
    this.display.number = number;
  }
  updateTagName() {
    // this.display.tagName = "o-cell";
    if (this.users[3]) {
      setInterval(() => {
        this.users[3].id = this.formatTime();
      }, 1000);
    }

  }
  users = [{
    id: 2
  }, {
    id: 3
  }];
  UpdateHtml() {
    // this.users[0].id = 6;
    this.users.push({
      id: Date.now()
    });
    // this.obj.a.c = Date.now();
    // this.display.staticHTML2 = "Hell world:" + Math.round(Math.random() * 10000);
    // this.display.staticHtml = "{count}";
    // Ref.clearElRef(this.__OG__.el.querySelector(".ref"),true);
    // fetch("./staticHTML.html").then(res => res.text()).then(res => {
    //   this.display.staticHtml = res;
    // });
    // this.dynimicElements.tag1 = "1";
    // this.useTransitionPreset("fadeHide", this.transitions.key);
    // return;
    // this.useTransitionPreset("fadeHide");
    return;
    this.transitionStop = this.transition(this.transitions.transitionName).step({
      transform: "translateX(0px)",
      transitionDuration: "0.3s",
      opacity: "1"
    }, () => {
      console.log("step end");
    }).step({
      opacity: "0",
      transform: "translateX(50px)",
      transitionDuration: "0.3s",
      transitionTimingFunction: "cubic-bezier(0.47, -0.38, 0.46, 1.43)"
    }).end(() => {
      console.log("end");
    }).step({
      opacity: "1",
      transform: "translateY(60px)",
      transitionDuration: "0.3s",

    }).step({
      transform: "translateY(120px)",
      transitionDuration: "0.6s",
      // transitionDuration: "0.3s",
    }, () => {
      console.log("120px");

    })
  }
  transitions = {
    transitionName: "fadeHide",
    key: "count"
  }
  updateStaticHTML2 = () => {
    // this.display.staticHTML2 = "hhhhhhhh";
    // this.transitions.transitionName = "showA";
    this.obj.a.c = Date.now();
    console.log(this.obj.a.c);

  }
  elhtml = "<h1>Hello Originaljs</h1>";
  updateData(...rest) {
    console.log(rest);

    this.user.name = "https://sortablejs.github.io/Vue.Draggable/img/logo.c6a3753c.svg";
    this.display.show = !this.display.show;
  }
  updateCount() {
    // this.transitions.key = "obj";
    this.transitionStop.stop();
    // this.obj.a.c = Date.now();
    // this.display.show = !this.display.show;
    // console.log(this.obj.a.c);
  }
  continueTransition() {
    this.transitionStop.continue().step({
      transform: "translateY(200px)",
      // transitionDuration: "0.6s"
      transitionDuration: "0.3s",
    }, () => {
      console.log("120px");

    });
  }
  dynimicElements = {
    tag1: "div"
  }
  numbers = [1, 2, 3, 4];
  async computed() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(20);
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

class OTable extends OG.createElement() {
  constructor() {
    super();
    fetch("./ctable.html").then(res => res.text()).then(res => {
      this.render(res);
    });
  }
  rows = 10;
}

class OCell extends OG.createElement() {
  constructor() {
    super();
    this.render("O-CELL");
  }
}

OG.defineElement("o-table", OTable);
OG.defineElement("o-cell", OCell);
OG.defineElement("c-el", CEl);
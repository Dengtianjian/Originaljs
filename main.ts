import OG from "./src";
import Http from "./http";
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
    // BUG 如果请求前没数据 然后渲染完有数据 循环不会生效
    // DONE FOR 优化HTML问题
    // FIX FOR 替换循环的每一项问题 item
    // OP 获取表达式优化，之前是正则获取{} 现在改为获取{{  }}
    this.render(CElTemplate).then(res => {

      console.timeEnd("render");
    });
    Http.get("https://discuz.chat/apiv3/thread.list?perPage=10&page=" + this.page + "&filter[essence]=0&filter[attention]=0&filter[sort]=1&scope=0&dzqSid=86774261-1631617310784&dzqPf=pc").then(({ Data: res }) => {
      this.news.list = [res.pageData[0]];
      this.page++;
      this.news.loading = false;

    });

    this.news.loading = true;


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
    // setTimeout(() => {
    //   this.users.push(...[
    //     {
    //       id: 8
    //     }, {
    //       id: 9
    //     }, {
    //       id: 10
    //     }
    //   ])
    // }, 2000);
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
  page = 1;
  loadMoreThread() {
    this.news.loading = true;
    Http.get("https://discuz.chat/apiv3/thread.list?perPage=10&page=" + this.page + "&filter[essence]=0&filter[attention]=0&filter[sort]=1&scope=0&dzqSid=86774261-1631617310784&dzqPf=pc").then(({ Data: res }) => {
      this.page++;

      this.news.list.push(...res.pageData);
      window.scrollTo(0, window.scrollY + 100);
      this.news.loading = false;
    });
  }
  msg = "Hello world";
  user = {
    name: "https://lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/dcec27cc6ece0eb5bb217e62e6bec104.svg"
  };
  obj = {
    a: {
      c: 1
    }
  };
  count = 1;
  display = {
    show: false,
    number: 1,
    tagName: "o-table",
    staticHtml: `<p>{transitions.transitionName}</p>`,
    staticHTML2: "<h1>Hello static HTML2</h1>"
  };
  show = false;
  transitionStop = null;
  news = {
    list: [],
    loading: false
  }
  updateNumber(number) {
    // this.display.number = Date.now();
    this.users[2].numbers[0] = Date.now();
  }
  updateTagName() {
    this.display.tagName = "o-cell";
    // this.transitions.transitionName="show1";
    // if (this.users[3]) {
    //   setInterval(() => {
    //     this.users[3].id = this.formatTime();
    //   }, 1000);
    // }

  }
  users = [{
    id: 2,
    numbers: [0, 1, 2]
  }, {
    id: 3,
    numbers: [4, 5, 6]
  }];
  UpdateHtml() {
    // this.users[0].id = 6;
    this.users.push({
      id: Date.now(),
      numbers: [7, 8, 9]
    });
    // this.obj.a.c = this.obj.a.c === 1 ? 2 : this.obj.a.c === 2 ? 3 : 1;
    // this.display.staticHtml = "Hell world:" + Math.round(Math.random() * 10000);

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
  updateStaticHTML2(number, arrs, objac) {
    // this.display.staticHTML2 = "hhhhhhhh";
    this.transitions.transitionName = this.transitions.transitionName === "showA" ? 'FadeIn' : "showA";
    // this.obj.a.c = Date.now();
    // console.log(number,objac);

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

class OTable extends OG.createElement(["tabledata"]) {
  constructor() {
    super();
    fetch("./ctable.html").then(res => res.text()).then(res => {
      this.render(res);
    });
  }
  rows = 10;
  tabledata = []
  showTableData() {
    this.tabledata.push({
      id: 8
    })

  }
}

class OCell extends OG.createElement(["tabledata"]) {
  constructor() {
    super();
    this.render("This is O-CELL el");
  }
}

OG.defineElement("o-table", OTable);
OG.defineElement("o-cell", OCell);
OG.defineElement("c-el", CEl);

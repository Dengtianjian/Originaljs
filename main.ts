import OG, { defineElement } from "./src";
import Transition, { addTransition } from "./src/transition";

let template: string = `
<div data-number="{number} {obj.nums}">
<div><button onclick="updateObj" >Update</button></div>
A { number } B {obj.name} {obj.user.lastName}
<p tilte="{number} {obj.user.firstName}">
  {number}
</p>
{users.0.luckNums}
<o-for useritem in="users">
  <p>{useritem.name}</p>
  <p data-index="{useritem}">{useritem}</p>
  <div>
    <p data-a="{useritem}"></p>
    <o-for lucknum in="useritem.luckNums">
      {lucknum}
    </o-for>
  </div>
</o-for>
</div>
`;

template = `
<div class="fixed">
<button onclick="updateArr" >Update arr</button>
<button onclick="updateObj" >add Property</button>
</div>
<div class="fixed-placeholder"></div>
<style>
.fixed {
  position:fixed;
  z-index:9;
  padding:10px;
  width:100%;
  background-color:white;
  box-shadow:0 5px 10px rgba(0,0,0,0.2);
  box-sizing:border-box;
}
.fixed-placeholder {
  height:70px;
}
  .books {
    display: flex;
    padding: 25px;
    box-sizing: border-box;
    background-color: #fff;
    position: relative;
    transition:all 0.2s linear;
  }
  .books .poster {
    width: 100px;
    height: 140px;
    flex-shrink: 0;
    box-shadow: 3px 4px 12px 0 rgb(0 0 0 / 20%);
    overflow: hidden;
    background-color: #ccc;
  }
  .books .info {
    position: relative;
    flex-grow: 1;
    overflow: hidden;
    box-sizing: border-box;
    font-size: 14px;
    color: #2e3135;
    padding-left: 22px;
  }
  .books .title {
    font-size: 16px;
    font-weight: 700;
    /*animation:showTitle 0.5s ease-in-out;*/
    transform-origin:50% 50%;
  }
  @keyframes showTitle {
    0% {
      opacity:0;
      transform:scale(0);
    }
    100%{
      opacity:1,
      transform:scale(1);
    }
  }
  .books .desc {
    margin-top: 5px;
    line-height: 20px;
    height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    color: #71777c;
  }
  .info .author {
    display: flex;
    align-items: center;
    margin-top: 6px;
    overflow: hidden;
    white-space: nowrap;
  }
  .info .author .author-info {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .info .author .xiaoce-user {
    display: inline-flex;
    align-items: center;
    color: #000;
  }
  .info .author .hero {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    margin-right: 8px;
    background-position: 50%;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .info .author .author-name {
    color: #000;
    font-weight: 400;
  }
  .username {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2e3135;
  }
  .username .name {
    display: inline-block;
    vertical-align: top;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rank {
    margin-left: .33rem;
    vertical-align: middle;
  }
</style>
<o-for bookitem in="books">

<div>
<o-transition name="showBook">
<div class="books">
  <img class="poster" src="{bookitem.base_info.cover_img}" />
  <div class="info" data-content="{bookitem.base_info.title}" >
    <div class="title">{bookitem.base_info.title +" | "+ bookitem.base_info.title}</div>
    <div class="desc">{ bookitem.base_info.summary }</div>
     <div class="author">
     <div class="author-info"><object><a href="/user/1838039171075352" target="_blank" rel="" st:name="author"
           st:state="1838039171075352" class="xiaoce-user"><img src="{bookitem.user_info.avatar_large}"
             alt="{bookitem.user_info.user_name}的头像" class="lazy avatar hero"
             data-src="{bookitem.user_info.avatar_large}"> <a data-v-2ecffe9f="" href="/user/1838039171075352"
             target="_blank" rel="" class="username author-name"><span data-v-2ecffe9f="" class="name"
               style="max-width: 128px;">
               {bookitem.user_info.user_name}
             </span> <span data-v-3ac5fa19="" data-v-2ecffe9f="" blank="true" class="rank"><img
                 data-v-3ac5fa19=""
                 src="//sf3-scmcdn2-tos.pstatp.com/xitu_juejin_web/e108c685147dfe1fb03d4a37257fb417.svg"
                 alt="lv-3"></span> </a></a></object></div>
      <div class="author-desc"><span class="selfDescription">
          {bookitem.user_info.job_title} @ {bookitem.user_info.company}
        </span></div>
    </div>
  </div>
  </div>
  </o-transition>
</div>

</o-for>

`;

// template = `
// { numbers.a+numbers.b+obj.nums[1]+number }
// <div>{ show }</div>
// `;

template = `
<button onclick="updateMultiNumbers">Update</button>
<div data-exp="{ multiNumbers[0]+multiNumbers[1] }">{ multiNumbers[0]+multiNumbers[1] }</div>
`;

template = `
<div onclick="updateArr">Update</div>
<o-if condition="show">1</o-if>
<o-else-if condition="show===false">2</o-else-if>
<o-else>3</o-else>
<o-if condition="show">4</o-if>
`;

template = `
<button onclick="updateArr">Update</button>
<o-el html="{elHTML}"></o-el>
`;

template = await fetch("./cbutton.html").then(res => res.text());

// addTransition("showBook", {
//   opacity: "0",
//   transform: "translateY(50px)",
// }, [
//   {
//     transform: "translateY(0px)",
//     opacity: "1"
//   },
//   {
//     transform: "translateX(50px)",
//     opacity: "1"
//   }
// ]);
Transition.preset("showBook", {
  opacity: "0",
  transform: "translateY(50px)",
}).add({
  opacity: "1",
  transform: "translateY(0px)",
}).add({
  transform: "translateX(50px)",
}).add({
  transform: "translateX(0px)",
}, 0.5, "cubic-bezier(0.67, -0.71, 0.65, 1.47)");

class CButton extends OG.createElement() {
  connected() {
    console.time("total");
    // setInterval(() =>newP {
    //   this.update("number", this.formatTime());
    // }, 1000);
    // return;
    fetch("./mook/book_page1.json").then(res => res.json()).then(({ data }) => {
      console.time("total");
      this.books.push(data[0]);
      // this.books.push(data[1]);
      console.timeEnd("total");

      // console.time("transition");
      // this.useTransitionPreset("showBook");
      // this.transition("showBook");
      // let t = this.transition("showBook", {
      //   opacity: "0",
      //   transform: "translateY(50px)",
      // });
      // t.step({
      //   transform: "translateY(0px)",
      //   opacity: "1"
      // }, 0.3, "", 0, () => {
      //   console.log("translateX end");
      //   // if (Date.now() % 2 === 0) {
      //   //   t.stop();
      //   // }
      // }).step({
      //   transform: "translateX(50px)"
      // }).end(() => {
      //   this.show = true;
      //   console.timeEnd("transition");
      // });
    });
  }
  render() {
    return template;
  }
  rendered() {
    console.timeEnd("total");
  }
  elValue = `<div>{numbers}</div>`;
  elHTML = `<div>{number}</div>`;
  books = [];
  number = 123;
  numbers = {
    a: 2,
    b: 3
  }
  multiNumbers = [0, 1]
  obj = {
    name: "Admin",
    nums: [0, 1],
    user: {
      firstName: "aaa",
      lastName: "bbb",
      birthdays: [
        2021, 6, 6
      ]
    },
    a: {

    }
  }
  users = [
    {
      name: "admin",
      luckNums: [1, 2, 3]
    }, {
      name: "Test",
      luckNums: [4, 5, 6, 7, 8, 9]
    }
  ];
  user = {
    name: {
      firstName: "Deng",
      lastName: "Tianjian"
    } as { [key: string]: any },
    times: {
      register: "2021-02-24",
      lastLogin: "2021-06-28",
    },
    friends: ["Amy", "Bob", "Candy", "Daisy", "Eva"],
    profile: {
      address: "Guangzhou",
      phone: "1328888999"
    }
  };
  count = 1;
  show = true;
  transitionName = "showBook";
  updateTransition() {
    if (this.transitionName === "showBook") {
      this.transition(this.transitionName, {
        transform: "translateX(0px)"
      }).step({
        transform: "translateX(50px)"
      })
    } else {
      this.transition(this.transitionName, {
        transform: "translateX(0px)"
      }).step({
        transform: "translateY(" + Math.round(Math.random() * 100) + "px)"
      })
    }

  }
  updateTransition2() {
    console.log("updateTransition2");

    // this.transition("showBook", {
    //   transform: "translateX(0px)"
    // }).step({
    //   transform: "translateX(50px)"
    // })
  }
  position = {
    x: 0,
    y: 0
  }
  moveInBook = (event) => {
    this.position.x = event.x;
    this.position.y = event.y;
  }
  updateData = (book) => {
    console.log(book.buy_count);

    // this.update("transitionName", "newTransitionName");
    //   this.update("elHTML", `
    //   <div>{count}</div>
    // `);
    // this.update("number", Date.now());
    // fetch("./elHTML.html").then(res => res.text()).then(res => {
    //   this.update("elHTML", res);
    // })
    // this.user.name = {
    //   a: "Admin"
    // }
    // this.update("user.name", {
    //   a: "Admin"
    // });
  }
  pages = 1;
  removeRef() {
    // this.update("count", Math.round(Math.random() * 10000));
    fetch("./mook/book_page1.json").then(res => res.json()).then(res => {
      console.log(res);
      this.pages++;
      this.books.push(...res.data);
    });
    this.user.name = {
      b: "Bob"
    }
    // this.setStatic(this.__og__.el.querySelector("p[data-number]"));
  }
  updateMultiNumbers() {
    this.multiNumbers[0] = Math.round(Math.random() * 10000);
  }
  updateArr = (event) => {
    // fetch("./elHTML.html").then(res => res.text()).then(res => {
    //   this.update("elHTML", res);
    // });
    // this.update("books[0].base_info.summary", Date.now());
    this.books[0].base_info.summary = "" + Date.now() + "";
    console.log(this.books[0].base_info.id);

    return;
    // this.update("show", this.show === "none" ? 'flex' : 'none');
    // console.log(this.books);

    // this.username = "Tianjian";
    // this.update("username", "Tianjian");
    // this.update("number", 88);
    // this.setAttribute("aa", "8");
    // Object.defineProperty(this, "a", {
    //   value: 8,
    //   set(v) {
    //     console.log(v);

    //   }
    // })
    // this.books[0].base_info.title = "";
    // console.log(this.books);
    // this.books[0].base_info.title = "";
    // this.books.splice(0, 2);
    // this.number = Date.now();
    fetch("./mook/book_page1.json").then(res => res.json()).then(({ data }) => {

      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const element = data[key];
      //     element.base_info.title = "";
      //   }
      // }
      // console.log(data);

      // this.books[0].base_info.title = "新疆大爷用魔方拼出中国共产党万岁";
      // if (this.index == 3) {
      //   this.books[0].base_info.title = "新疆大爷用魔方拼出中国共产党万岁";
      // }
      // if (this.index == 6) {
      //   this.books[0].base_info.title = "汪文斌:抹黑让新疆棉花更供不应求";
      // }
      // if (this.index == 9) {
      //   this.books[0].base_info.title = "96岁老党员跨时空对话牺牲战友 ";
      // }
      // this.books.push(data[this.index++]);
      // this.books[0]=data[0];
      // return;
      console.time();
      this.books.push(...data);
      this.useTransitionPreset("showBook");
      console.timeEnd();
      return;
      console.time("transition");
      this.transition("showBook", {
        display: "flex",
        transform: "translateY(-50px)",
        opacity: "0"
      }).step({
        transform: "translateY(0px)",
        opacity: "1"
      }, 1).end(() => {
        this.show = true;
        console.timeEnd("transition");
      })

      // this.update("books", data);
      // this.books[0] = data[0];
      // data.forEach((item, index) => {
      //   this.books[index] = item;
      // })
      // this.books = data;
      // console.log(this.books);

      // this.books.push(...data);
    });
    // setTimeout(() => {
    //   this.books[0]['base_info']['title'] = "深入了解区块链、挖矿、钱包、签名等技术原理，对未来的数字货币世界做好准备";
    // }, 5000);
  }
  updateObj() {
    if (this.show) {
      this.transition("showBook").step({
        transform: "translateY(-50px)",
        opacity: "0"
      }).step({
        display: "none"
      }, 0).end(() => {
        console.log("end");

        this.show = false;
      });
    } else {
      this.transition("showBook", {
        display: "flex",
        transform: "translateY(-50px)",
        opacity: "0"
      }).step({
        transform: "translateY(0px)",
        opacity: "1"
      }).end(() => {
        this.show = true;
      })
    }
  }
  formatTime(): string {
    const d = new Date();
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${this.patchZero(d.getHours())}:${this.patchZero(d.getMinutes())}:${this.patchZero(d.getSeconds())}`;
  }
  patchZero(rawString: string | number): string | number {
    return rawString < 10 ? `0${rawString}` : rawString;
  }
}

defineElement("c-button", CButton);
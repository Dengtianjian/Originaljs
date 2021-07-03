import { time } from "console";
import {
  defineElement,
  createElement,
  Reactive
} from "./runtime";

// let template: string = await import("./components/templates/cbutton.html");
// template = template.default;

// let template = Query("#CButton").content.cloneNode(true);

let template: string = `<style>
button {
    padding: 5px;
    border: none;
    cursor: pointer;
  }
  button:hover {
    color: white;
    background-color: blueviolet;
  }
  .c-button_primary {
    color:white;
    transition:0.2s linear all;
    background-color:blueviolet;
  }
  .c-button_primary:hover {
    background-color:#6b21af;
  }
</style>
<button class="{_className}" title="aaa" data-date="2021" data-a={showEl} style="position:{position};">
  <slot></slot>
  {num}
  <span onclick="startMove;moving('moving','aa','{showEl}');endMove" >&nbsp;{name}</span>
  <div style="margin-top:20px;width:200px">
  {obj.a}
  {nums[1].a}
    <div onclick="show;endMove('{position}')" onmouseenter="show"  >
    {name}
    </div>
  </div>
</button>`;
template = `
<button onclick="updateArr" >Update arr</button>
<button onclick="addProperty" >add Property</button>
<style>
  .books {
    display: flex;
    padding: 25px;
    box-sizing: border-box;
    background-color: #fff;
    position: relative;
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
    animation:showTitle 0.5s ease-in-out;
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
{number}
<o-for bookitem in books>
<div class="books">
  <img class="poster" src="{bookitem.base_info.cover_img}" />
  <div class="info" data-content="{bookitem.base_info.title}">
    <div class="title">{bookitem.base_info.title}</div>
    <div class="desc">{ bookitem.base_info.summary }</div>
    <div>
      { bookitem.user_info.user_name }
     </div>
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
</o-for>
<p>{number}</p>
<o-for bookitem in books>
</o-for>
<o-for dataitem in user>
  <div>
    <o-for data in dataitem>
      <div title="{data}">
      { data }
      </div>
    </o-for>
    <br />
  </div>
  <o-for bookitem in books>
  <div class="books">
    <img class="poster" src="{bookitem.base_info.cover_img}" />
    <div class="info" data-content="{bookitem.base_info.title}">
      <div class="title">{bookitem.base_info.title}</div>
      <div class="desc">{ bookitem.base_info.summary }</div>
      <div>
        { bookitem.user_info.user_name }
       </div>
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
  </o-for>
</o-for>
`

// template = `
// <button onclick="updateArr" >Update arr</button>
// <button onclick="addProperty" >add Property</button>
// <div>数字：{ number } @ <p>{  username  }</p> 注册时间：{registerTime}</div>
// `;

template = `
<div>
  <button onclick="updateArr" >Update arr</button>
</div>

<o-for bookitem in books>
  {bookitem}
  {bookitem}
  {bookitem}
</o-for>

<div>
  <o-for bookitem in books>
  {bookitem}
  </o-for>
</div>

`;
template = `
div>
  <button onclick="updateArr" >Update arr</button>
</div>
<o-for bookitem in books>
  <h1>\{ books.0.base_info.title\}</h1>
  <div>
  {bookitem.base_info.title} |
  {bookitem.base_info.title}
  <p>\\{bookitem.base_info.title\\}</p>
  </div>
</o-for>
`;

template = "{ books.0.base_info.title }";

class CButton extends createElement(["name", "aa"]) {
  constructor() {
    super();
    const body = JSON.stringify({
      category_id: "0",
      cursor: "20",
      limit: 20
    });
    fetch("./mook/book_page1.json").then(res => res.json()).then(({ data }) => {
      // data[0]['test'] = Date.now();
      // this.books.push(data[0]);
    });
  }
  show() {
    console.log(1);
  }
  startMove(event) {
    // event.stopPropagation();
    console.log(event);
  }
  moving(p) {
    console.log(p);
  }
  endMove(position) {
    console.log(position);
  }
  render() {
    return template;
  }
  number = 6;
  arrs = {
    nums: [0, 1, 2]
  };
  nums = [1, 2];
  numarr = [[123, 456, 5], ["456"]];
  books = [];
  user = {
    name: {
      firstName: "Deng",
      lastName: "Tianjian"
    },
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
  username = "Admin";
  registerTime = this.formatTime();
  index = 0;
  updateArr(event) {
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
    fetch("./mook/book_page2.json").then(res => res.json()).then(({ data }) => {
      // for (const key in data) {
      //   if (Object.prototype.hasOwnProperty.call(data, key)) {
      //     const element = data[key];
      //     element.base_info.title = "";
      //   }
      // }
      if (this.index == 3) {
        this.books[0].base_info.title = "新疆大爷用魔方拼出中国共产党万岁";
      }
      if (this.index == 6) {
        this.books[0].base_info.title = "汪文斌:抹黑让新疆棉花更供不应求";
      }
      if (this.index == 9) {
        this.books[0].base_info.title = "96岁老党员跨时空对话牺牲战友 ";
      }
      this.books.push(data[this.index++]);
      // this.books.unshift(...data);
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
  addProperty() {
    // setInterval(() => {
    //   this.update("registerTime", this.formatTime());
    // }, 1000);
    this.books[0].base_info.time = Date.now();
  }
  formatTime(timestamp = Date.now()) {
    const d = new Date(timestamp);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  }
}

defineElement("c-button", CButton);

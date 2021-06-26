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
<style>
  .books {
    display: flex;
    padding: 25px;
    box-sizing: border-box;
    background-color: #fff;
    position: relative;
  }
  .books img {
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
</style>
<o-for dataitem in books>
<div class="books">
  <img src="{dataitem.base_info.cover_img}" />
  <div class="info">
    <div class="title">{dataitem.base_info.title}</div>
    <div class="desc">{ dataitem.base_info.summary }</div>
  </div>
  <div>
  </div>
</div>
</o-for>`

class CButton extends createElement(["name"]) {
  constructor() {
    super();
    const body = JSON.stringify({
      category_id: "0",
      cursor: "20",
      limit: 20
    });
    fetch("./mook/book_page1.json").then(res => res.json()).then(({ data }) => {
      this.books.push(...data);
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
  arrs = {
    nums: [0, 1, 2]
  };
  nums = [1, 2];
  numarr = [[123, 456, 5], ["456"]];
  books = [];
  updateArr(event) {
    // TODO 没有深度代理
    this.books[2]['base_info']['title'] = "配置文件解析";

    fetch("./mook/book_page2.json").then(res => res.json()).then(({ data }) => {
      this.books.push(...data);
    });
    setTimeout(() => {
      this.books[36]['base_info']['title'] = "深入了解区块链、挖矿、钱包、签名等技术原理，对未来的数字货币世界做好准备";
    }, 10000);
  }
}

defineElement("c-button", CButton);

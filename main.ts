import OG, { defineElement } from "./src";

let template: string = `
<div data-number="{number} {obj.nums}">
<div><button onclick="updateObj" >Update</button></div>
A{ number }B {obj.name} {obj.user.lastName}
<p tilte="{obj.a.b} {number}">
  {obj.a.b}
</p>
</div>
`;

class CButton extends OG.createElement() {
  render() {
    return template;
  }
  number = 123;
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
  count = 1;
  updateObj() {
    // this.number = 456;
    this.update("number", null);
    // this.obj.nums[2] = this.formatTime().toString();
    // this.obj.a = {
    //   b: {
    //     c: 2,
    //     d: [1, 2, 3, 4, 5],
    //     e: {
    //       f: 2
    //     }
    //   }
    // }
    // this.count++;
    // if (this.count == 3) {
    //   this.obj = null;
    // }
    // setInterval(() => {
    //   this.obj.user.lastName = this.formatTime();
    // }, 1000);
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
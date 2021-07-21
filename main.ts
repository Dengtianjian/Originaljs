import OG, { defineElement } from "./src";

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

class CButton extends OG.createElement() {
  connected() {
    setInterval(() => {
      this.update("number", this.formatTime());
    }, 1000);
  }
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
  users = [
    {
      name: "admin",
      luckNums: [1, 2, 3]
    }, {
      name: "Test",
      luckNums: [4, 5, 6, 7, 8, 9]
    }
  ];
  count = 1;
  updateObj() {
    delete this.obj.user;
    // this.number = 456;
    // this.update("number", 789);
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
    //   this.update("number", 456);
    // }
    // this.obj.user.lastName = "666";
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
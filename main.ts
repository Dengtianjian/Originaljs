import OG, { defineElement } from "./src";

let template: string = `
<div data-number="{number} {obj.nums}">
<div><button onclick="updateObj" >Update</button></div>
A{ number }B {obj.name} {obj.user.lastName}
<p>
  {obj.nums[2]}
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
    nums: [0, 1, 2, 3, 4],
    user: {
      firstName: "aaa",
      lastName: "bbb",
      birthdays: [
        2021, 6, 6
      ]
    }
  }
  updateObj() {
    // this.number = 456;
    // this.update("number", 456);
    this.obj.nums[2]=3;
  }
}

defineElement("c-button", CButton);
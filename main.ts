import OG from "./src";

class CEl extends OG.createElement() {
  constructor() {
    super();
    this.render(`
    { {username} + this.age }
    `);
  }
  username = "admin";
  number = 6;
  age = 20;
  numbers = [0, 1, 2, 4, 5, 8]
  computed() {
    return 8;
  }
}

OG.defineElement("c-el", CEl);
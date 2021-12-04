import OG from "./src";

class CEl extends OG.createElement() {
  constructor() {
    super();
    this.render(`
    <div>
    {{ age }}
    <p> {{ username }} { { number } +2 } </p>
    </div>
    `);
  }
  username = "admin";
  number = 6;
  age = 20
}

OG.defineElement("c-el", CEl);
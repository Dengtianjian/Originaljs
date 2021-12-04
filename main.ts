import OG from "./src";

class CEl extends OG.createElement() {
  constructor() {
    super();
    this.render(`
    <p>Hello Originaljs {{ users[0].nickname } + 2 + { users[3].nickname }} {} { computed } { { users[1].nickname } }</p>
    `);
  }
}

OG.defineElement("c-el", CEl);
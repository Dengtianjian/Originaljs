import OG from "./src";

class CEl extends OG.createElement() {
  constructor() {
    super();
  }
}

OG.defineElement("c-el", CEl);
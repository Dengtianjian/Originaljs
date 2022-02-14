import OG from "./src";

function loadTemplate(fileName) {
  return fetch(`${fileName}.html`).then(res => res.text());
}

function datePatchZero(dateEl: number | string): string | number {
  return dateEl < 10 ? `0${dateEl}` : dateEl;
}
function formatTime(): string {
  let timeString: string = "";
  let d: Date = new Date();
  timeString = `${d.getFullYear()}-${datePatchZero(d.getMonth() + 1)}-${datePatchZero(d.getDate())} ${datePatchZero(d.getHours())}:${datePatchZero(d.getMinutes())}:${datePatchZero(d.getSeconds())}`;

  return timeString;
}

let user = {
  age: 2021,
  name: "admin",
  friends: [
    "Jack"
  ]
}

class CEl extends OG.createElement() {
  constructor() {
    super();
    loadTemplate("cel").then(res => {
      this.render(res);
    });
    // setInterval(() => {
    //   this.user.age = formatTime();
    // }, 1000);
  }
  user = user
  update() {
    return "show";
  }
}

OG.defineElement("c-el", CEl);
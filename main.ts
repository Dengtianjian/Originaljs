import OG from "./src";

async function loadTemplate(fileName) {
  // @ts-ignore
  return import("./src/Templates/el.html").then(res => {
    return res.default;
  });
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
  ],
  fontColor: "blue"
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
  user = user;
  users = ["admin", "test", "job", "jack"];
  update() {
    return "show";
  }
}

OG.defineElement("c-el", CEl);
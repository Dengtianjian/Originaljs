import OG from "./src";

async function loadTemplate(fileName) {
  // @ts-ignore
  return import(`./src/Templates/${fileName}.html`).then(res => {
    return decodeURI(res.default);
  });
}

function datePatchZero(dateEl: number | string): string | number {
  return dateEl < 10 ? `0${dateEl}` : dateEl;
}
function formatTime(): string {
  let timeString: string = "";
  let d: Date = new Date();
  timeString = `${d.getFullYear()}-${datePatchZero(d.getMonth() + 1)}-${datePatchZero(d.getDate())} ${datePatchZero(d.getHours())}:${datePatchZero(d.getMinutes())}:${datePatchZero(d.getSeconds())}:${d.getMilliseconds()}`;

  return timeString;
}

class CEl extends OG.createElement() {
  constructor() {
    super();
    loadTemplate("el").then(res => {
      this.render(res);
    });
    setInterval(() => {
      this.user.time = formatTime();
    }, 100);
  }
  user = {
    age: 2021,
    time: "2022",
    name: "admin",
    friends: [
      "Jack"
    ],
    fontColor: "blue"
  };
  users = ["admin", "test", "job", "jack"];
  title = "EdgeDB 架构简析";
  update() {
    return "show";
  }
}

OG.defineElement("c-el", CEl);
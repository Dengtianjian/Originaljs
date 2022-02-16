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
    // setInterval(() => {
    //   this.user.time = formatTime();
    // }, 100);
    // setTimeout(() => {
    //   this.users.push("a");
    // }, 2000);
  }
  user = {
    name: "天天向上的天健",
    description: "程序员👨‍💻",
    follow: {
      follower: 2,
      followed: 1
    },
    statistics: {
      docs: 88,
      likes: 8
    }
  };
  users = ["admin", "test", "job", "jack","candy"];
  title = "EdgeDB 架构简析";
  update() {
    return "show";
  }
}

OG.defineElement("c-el", CEl);
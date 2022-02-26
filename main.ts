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
    loadTemplate("el").then(template => {
      // fetch("https://discuz.chat/api/v3/thread.list?perPage=10&page=1&filter[essence]=0&filter[attention]=0&filter[sort]=1&scope=0&dzqSid=38358337-1636364502364&dzqPf=pc").then(res => res.json()).then(({ Data: { pageData } }) => pageData).then((res) => {
      //   this.articles.push(...res);
      //   this.render(template);
      // })
      this.render(template);
    });

    let count = 0;
    let colors = [
      "LightCyan",
      "red",
      "GoldenRod",
      "blue",
      "green",
      "yellow",
      "aliceBlue",
      "Gold",
      "GoldenRod",
      "LightSteelBlue",
      "Maroon",
      "MediumAquaMarine",
      "MediumPurple",
      "Moccasin",
      "Navy",
      "Indigo",
      "Lavender"
    ];
    setInterval(() => {
      if (count === colors.length) {
        count = 0;
      }
      this.cssStyle.color = colors[count];

      count++;
    }, 100);
    // setTimeout(() => {
    //   this.cssStyle.color = "blue";
    //   // this.users.push("a");
    //   //   this.user.time = formatTime();
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
    },
    time: "a"
  };
  articles = [];
  users = ["admin", "test", "job", "jack", "candy"];
  title = "EdgeDB 架构简析";
  color = "red";
  cssStyle = {
    color: "red",
    fontSize: "16px"
  }
  update() {
    return "show";
  }
}

OG.defineElement("c-el", CEl);
import OG from "./src";

function datePatchZero(dateEl: number | string): string | number {
  return dateEl < 10 ? `0${dateEl}` : dateEl;
}
function formatTime(): string {
  let timeString: string = "";
  let d: Date = new Date();
  timeString = `${d.getFullYear()}-${datePatchZero(d.getMonth() + 1)}-${datePatchZero(d.getDate())} ${datePatchZero(d.getHours())}:${datePatchZero(d.getMinutes())}:${datePatchZero(d.getSeconds())}`;

  return timeString;
}

class CEl extends OG.createElement() {
  constructor() {
    super();
    this.render(`
    <p>{{user.age}}</p>
    <div>{ {user.friends[0]} }</div>
    <div>{ {user.friends[0]} }</div>
    `);
    setInterval(() => {
      this.user.friends[0] = formatTime();
    }, 1000);
  }
  user = {
    age: 2021,
    name: "admin",
    friends: [
      "Jack"
    ]
  }
}

OG.defineElement("c-el", CEl);
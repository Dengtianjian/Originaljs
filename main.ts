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
    <div>{ {user.age} }</div>
    <div>{ {user.age} + 2 }</div>
    <div>{ () => Date.now() }</div>
    <div>{ () => 1 + 2 + {user.age} }</div>
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
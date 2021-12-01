import OG from "./src";

let template: string = `
{{ data.numbers }}
<p>{{ data.numbers[2] }}</p>
`;

class CEl extends OG.createElement() {
  constructor() {
    super();
    this.render(template);
    setInterval(() => {
      // this.users[2]['nickname'] = "Eya";
      this.data.numbers[2] = this.formatTime();
    }, 1000);
    // let count = 0;
    // let timer = setInterval(() => {
    //   this.users.push({
    //     nickname: String(Date.now())
    //   });
    //   count++;
    //   if (count == 5) {
    //     clearInterval(timer);
    //     setTimeout(() => {
    //       this.updateData("users", [
    //         {
    //           nickname: "2022-01-01"
    //         }
    //       ]);
    //     }, 1000)
    //   }
    // }, 1000);
    // setTimeout(() => {
    //   this.updateData("data.numbers", [
    //     15, 323, 95, 65
    //   ]);
    //   console.log("update data");
    //   setTimeout(() => {
    //     this.updateData("data.numbers", [
    //       20, 232, 85, 96, 78, 12, 36
    //     ]);
    //     console.log("update data");
    //     // setTimeout(() => {
    //     //   // this.users[2]['nickname'] = "Eya";
    //     //   this.data.numbers[2] = 666;
    //     // }, 1000);
    //   }, 5000);
    // }, 1000)
  }
  data = {
    numbers: [45, 78, 62, 23, 12]
  }
  user = {
    nickname: "admin",
    friends: {
      jack: 1,
      candy: 2
    }
  }
  users = [
    {
      avatar: "https://t7.baidu.com/it/u=1314925964,1262561676&fm=193&f=GIF",
      nickname: "Alex"
    }, {
      avatar: "https://t7.baidu.com/it/u=1314925964,1262561676&fm=193&f=GIF",
      nickname: "Bob"
    }, {
      avatar: "https://t7.baidu.com/it/u=1314925964,1262561676&fm=193&f=GIF",
      nickname: "Candy"
    }, {
      avatar: "https://t7.baidu.com/it/u=1314925964,1262561676&fm=193&f=GIF",
      nickname: "Duck"
    }
  ]
  computed() {
    return Date.now();
  }
  datePatchZero(dateEl: number | string): string | number {
    return dateEl < 10 ? `0${dateEl}` : dateEl;
  }
  formatTime(): string {
    let timeString: string = "";
    let d: Date = new Date();
    timeString = `${d.getFullYear()}-${this.datePatchZero(d.getMonth() + 1)}-${this.datePatchZero(d.getDate())} ${this.datePatchZero(d.getHours())}:${this.datePatchZero(d.getMinutes())}:${this.datePatchZero(d.getSeconds())}`;

    return timeString;
  }
}

OG.defineElement("c-el", CEl);
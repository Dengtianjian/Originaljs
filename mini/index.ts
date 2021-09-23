function updateView(content) {
  document.querySelector("#app").innerHTML = content;
}

function transformObjectToString(target: any): string | number {
  if (typeof target === "object" && target !== null) {
    const valueItem: string[] = [];
    for (const key in target) {
      if (Array.isArray(target[key])) {
        valueItem.push(`${key}: [ ${target[key].toString()} ]`);
      } else if (typeof target[key] === "object" && target[key] !== null) {
        valueItem.push(`${key}: ${transformObjectToString(target[key])}`);
      } else {
        if (target[key] === null || target[key] === undefined) {
          target[key] = target[key] === null ? "null" : "undefined";
        }
        valueItem.push(`${key}: ${target[key].toString()}`);
      }
    }

    if (Array.isArray(target)) {
      return `[ ${valueItem.join(",")} ]`;
    }
    return `{ ${valueItem.join(",")} }`;
  }
  if (target === null) return "null";
  if (target === undefined) return "undefined";
  if (isNaN(target)) return target.toString();
  return Number(target);
}

const App = document.querySelector("#app");
const Ul = App.querySelector(".ul");
const Ref = App.querySelector(".ref");

function setProxy(data) {
  for (const key in data) {
    if (typeof data[key] === "object") {
      data[key] = new Proxy(data[key], {
        set(target, propertyKey, value) {
          if (Array.isArray(target)) {
            if (propertyKey === "length") return true;

            Ul.innerHTML += "<p>" + transformObjectToString(value) + "</p>";
          } else {
            Ref.innerHTML = transformObjectToString(value);
            Ref.attributes["title"].nodeValue = transformObjectToString(value);
          }

          return true;
        },
      });
      setProxy(data[key]);
    }
  }
}

const data = {
  users: [
    {
      id: 2,
    },
  ],
  friends: {
    name: "2021",
  },
};

setProxy(data);
data.users.push({
  id: 6,
});

function pushNew() {
  data.users.push({
    id: Date.now(),
  });
}

function update() {
  data.friends.name = Math.round(Math.random() * 10000);
  //   console.log(data);
}
// data.friends.name = "888";

function deepUpdate(data) {
  for (const key in data) {
    if (typeof data[key] === "object") {
      deepUpdate(data[key]);
    } else {
      data[key] = data[key];
    }
  }
}
deepUpdate(data);
console.log(data);

// updateView("aa");
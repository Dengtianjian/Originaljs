## 例子
### 基本
##### js
``` js
import OG from "originaljs";

class HelloWorld extends OG.createElement(){
  name="World";
  render(){
    return "<div title="{name}">Hello {name}</div>"
  }
}

OG.defineElement("hello-world",HelloWorld);
```
##### HTML
``` html
<hello-world></hello-world>
```

### 可变化
##### js
```js
import OG from "originaljs";

class GoodsPrice extends OG.createElement(){
  render(){
    return `
    <button onclick="changePrice">Change</button>
    <div>{price}</div>
    `;
  }
  price=8.8;
  changePrice(){
    this.update("price",9.9);
  }
}

OG.defineElement("goods-price",HelloWorld);
```
##### HTML
``` html
<goods-price></goods-price>
```

### Props
```js
import OG from "originaljs";

class UserNickname extends OG.createElement(["nickname"]){
  render(){
    return `
    <div>{nickname}</div>
    `;
  }
  nickname="JavaScript";
}

OG.defineElement("user-nickname",HelloWorld);
```
##### HTML
``` html
<user-nickname nickname="Originaljs"></user-nickname>
```
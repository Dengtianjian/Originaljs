## 例子
#### js
``` js
import OG from "originaljs";

class HelloWorld extends OG.createElement(){
  name="World";
  render(){
    return "<div>Hello {name}</div>"
  }
}

OG.defineElement("hello-world",HelloWorld);
```
#### HTML
``` html
<hello-world></hello-world>
```
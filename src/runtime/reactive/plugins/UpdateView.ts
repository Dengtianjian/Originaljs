export default {
  updateView(target, propertys, property, value) {
    if (propertys[property]) {
      const replaceValue: string = value.toString();
      if (propertys[property].__els) {

        const els: HTMLElement[] = propertys[property]['__els'];

        els.forEach(el => {
          el.textContent = replaceValue + "\n";
        });
      }
      if (propertys[property].__attrs) {
        const attrs: Attr[] = propertys[property]['__attrs'];
        attrs.forEach(attr => {
          attr.nodeValue = replaceValue;
        });
      }
    }
  }
}
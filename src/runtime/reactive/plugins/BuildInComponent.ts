import { IElement } from "../../../types/elementType";
import { IPluginItem } from "../../../types/pluginType";
import plugin from "../../plugin";
import Collect from "../collect";

export default {
  buildInComponentTagNames: ["o-for", "o-if", "o-else", "o-else-if"] as string[],
  handleOFor(El: IElement, rawData: {}) {
    const attributes: Attr[] = Array.from(El.attributes);
    let InIndex: number = -1;
    let indexName: string = "";
    let propertyName: string = "";
    let keyName: string = "";
    let itemName: string = "";
    const childNodes: Node[] = [];
    El.childNodes.forEach(node => {
      childNodes.push(node.cloneNode(true));
    });

    attributes.forEach((attr, index) => {
      if (attr.nodeName === "in") {
        InIndex = index;
      }
    });

    propertyName = attributes[InIndex + 1]['nodeName'];
    if (InIndex == 2) {
      indexName = attributes[InIndex - 1]['nodeName'];
      itemName = attributes[InIndex - 2]['nodeName'];
    } else if (InIndex == 3) {
      keyName = attributes[InIndex - 1]['nodeName'];
      indexName = attributes[InIndex - 2]['nodeName'];
      itemName = attributes[InIndex - 3]['nodeName'];
    } else {
      itemName = attributes[InIndex - 1]['nodeName'];
    }

    const propertyNames: string[] = Collect.parsePropertyString(propertyName);
    const property: any[] = Collect.getPropertyData(propertyNames, rawData);

    const newEls = [];
    property.forEach((item, pindex) => {
      const newEl = [...Array.from(childNodes)];
      newEl.forEach((el, index) => {
        newEl[index] = el.cloneNode(true);
        this.replaceRef(newEl[index] as HTMLElement, new RegExp(`(?<=\{\x20*)${itemName}`, "g"), `${propertyNames.join(".")}.${pindex}`);
      })
      newEls.push(newEl);
    });

    Array.from(El.children).forEach(node => {
      El.removeChild(node);
    })
    newEls.forEach(els => {
      El.append(...els);
    });

    const ref = (plugin.use("CollectTagRefs") as IPluginItem).collectRef(El,);

    return Collect.objectAssign(Collect.deepGenerateTree(propertyNames, {
      __og_fors: [
        {
          el: El,
          templateChildNodes: childNodes,
          indexName,
          propertyName,
          keyName,
          itemName
        }
      ]
    }), ref);
  },
  replaceRef(El: HTMLElement, string: string | RegExp, replaceValue: string) {
    if (El.childNodes.length > 0) {
      El.childNodes.forEach(node => {
        this.replaceRef(node as HTMLElement, string, replaceValue);
      })
    }

    if (El.attributes && El.attributes.length > 0) {
      this.replaceAttrRef(El, string, replaceValue);
    }

    if (El.nodeType !== 3) {
      return;
    }

    El.textContent = El.textContent.replace(string, replaceValue);
  },
  replaceAttrRef(El: HTMLElement, string: string | RegExp, replaceValue: string) {
    if (El.attributes.length === 0) {
      return;
    }
    for (const attrItem of Array.from(El.attributes)) {
      if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
        attrItem.nodeValue = attrItem.nodeValue.replace(string, replaceValue);
      }
    }

  },
  collectRef(El: IElement, rawData) {
    let ScopedElRefTree = {};

    if (El.__og_isCollected) {
      return ScopedElRefTree;
    }

    if (El.childNodes && El.childNodes.length > 0) {
      for (const node of Array.from(El.childNodes)) {
        ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.collectRef(node as IElement, rawData));
      }
    }

    if (El.nodeType !== 1 || !this.buildInComponentTagNames.includes(El.tagName.toLowerCase())) {
      return ScopedElRefTree;
    }

    const tagName: string = El.tagName.toLowerCase();
    switch (tagName) {
      case "o-for":
        ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.handleOFor(El,rawData));
        break;
    }

    return ScopedElRefTree;
  },
  updateView(target, propertys, property, value) {
    if (!propertys[property]) {
      if (Array.isArray(target) && property !== "length") {
        // console.log(target, propertys, property, value);
        const stateKey: string[] = Collect.parsePropertyString(target['__og_stateKey']);

        const rawData = Collect.getPropertyData(stateKey, target['__og_root']['rawData']);
        if (rawData[property]) {
          // console.log(rawData[property]);

        } else {
          // const newTextEl = document.createTextNode(value.toString() + "\n");
          // rawData[property] = value;
          // propertys[property] = {
          //   __els: [newTextEl],
          //   __attrs: []
          // }

          console.log(propertys.__og_fors);

          propertys.__og_fors.forEach(forItem => {
            forItem.templateChildNodes.forEach(node => {
              forItem.el.append(node.cloneNode(true));
            })

          })
        }
      }
    }
  }
} as IPluginItem & {}
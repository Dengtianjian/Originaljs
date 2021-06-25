import { IElement } from "../../../types/elementType";
import { IPluginItem } from "../../../types/pluginType";
import { IReactiveItem } from "../../../types/reactiveType";
import plugin from "../../plugin";
import Collect from "../collect";
import Parser from "../parser";

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
    const property: object | [] = Collect.getPropertyData(propertyNames, rawData);

    // TODO 替换key index
    const newEls = [];
    if (Array.isArray(property)) {
      property.forEach((item, pindex) => {
        const newEl = [...Array.from(childNodes)];
        newEl.forEach((el, index) => {
          newEl[index] = el.cloneNode(true);
          this.replaceRef(newEl[index] as HTMLElement, new RegExp(`(?<=\{\x20*)${itemName}`, "g"), `${propertyNames.join(".")}.${pindex}`);
        })
        newEls.push(newEl);
      });
    } else if (typeof property === "object") {
      let index = 0;
      for (const key in property) {
        if (Object.prototype.hasOwnProperty.call(property, key)) {
          const newEl = [...Array.from(childNodes)];
          newEl.forEach((el, i) => {
            newEl[i] = el.cloneNode(true);
            this.replaceRef(newEl[i] as HTMLElement, new RegExp(`(?<=\{\x20*)${itemName}`, "g"), `${propertyNames.join(".")}.${index}`);
          })
          newEls.push(newEl);
        }
        index++;
      }
    }


    Array.from(El.children).forEach(node => {
      El.removeChild(node);
    })
    newEls.forEach(els => {
      El.append(...els);
    });

    const ref = (plugin.use("CollectTagRefs") as IPluginItem).collectRef(El, rawData);

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
        ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.handleOFor(El, rawData));
        break;
    }

    return ScopedElRefTree;
  },
  updateView(target: IReactiveItem, propertys, property, value) {
    // console.log(target, propertys, property);

    if (!propertys[property]) {
      const stateKey: string[] = Collect.parsePropertyString(target['__og_stateKey']);
      const rawDataPart = Collect.getPropertyData(stateKey, target['__og_root']['rawData']);
      const rawData = target.__og_root.rawData;

      if (rawDataPart[property]) {
        // console.log(rawData[property]);

      } else {
        if (Array.isArray(rawDataPart)) {
          Collect.getPropertyData(Collect.parsePropertyString(target.__og_stateKey), rawData).push(value);
        } else {
          Collect.getPropertyData(Collect.parsePropertyString(target.__og_stateKey), rawData)[property] = value;
        }

        let scopeRefTree = {};
        propertys.__og_fors.forEach(forItem => {
          const newEls = [];
          const propertyNames = Collect.parsePropertyString(forItem.propertyName);
          forItem.templateChildNodes.forEach(node => {
            const newEl = node.cloneNode(true);
            this.replaceRef(newEl as HTMLElement, new RegExp(`(?<=\{\x20*)${forItem.itemName}`, "g"), `${propertyNames.join(".")}.${property}`);
            newEls.push(newEl);
          });
          forItem.el.append(...newEls);

          forItem.el.__og_isCollected = false;
          console.log(rawData);

          const refTree = (plugin.use("CollectTagRefs") as IPluginItem).collectRef(forItem.el, rawData);

          Parser.parseRef(refTree, rawData);

          scopeRefTree = Collect.objectAssign(scopeRefTree, refTree);
        });
        target.__og_root.refs = Collect.objectAssign(target.__og_root.refs, scopeRefTree);
      }
    }
  }
} as IPluginItem & {}
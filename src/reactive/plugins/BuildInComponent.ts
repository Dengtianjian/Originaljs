import { IElement } from "../../types/elementType";
import { IPluginItem, TPropertys, TRefTree } from "../../types/pluginType";
import { IReactiveItem } from "../../types/reactiveType";
import plugin from "../../plugin";
import Collect from "../collect";
import OProxy from "../oproxy";
import Parser from "../parser";
import { updateTargetView } from "../view";
import parser from "../parser";
import utils from "../../utils";
import collect from "../collect";

export default {
  buildInComponentTagNames: ["o-for", "o-if", "o-else", "o-else-if", "ref"] as string[],
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

    const propertyNames: string[] = parser.parseRefString(propertyName);
    const property: object | [] = Collect.getPropertyData(propertyNames, rawData);

    // TODO 替换key index
    const newEls = [];
    if (Array.isArray(property)) {
      property.forEach((item, pindex) => {
        const newEl = [...Array.from(childNodes)];
        newEl.forEach((el, index) => {
          newEl[index] = el.cloneNode(true);
          this.replaceRef(newEl[index] as HTMLElement, itemName, `${propertyNames.join(".")}.${pindex}`);
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
            this.replaceRef(newEl[i] as HTMLElement, itemName, `${propertyNames.join(".")}.${key}`);
          })
          newEls.push(newEl);
        }
        index++;
      }
    }

    El.textContent = "";

    Array.from(El.children).forEach(node => {
      El.removeChild(node);
    })
    newEls.forEach(els => {
      El.append(...els);
    });
    const refs = utils.generateObjectTree(propertyNames, {
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
    });

    return refs;
  },
  replaceRef(El: HTMLElement, sourceString: string, replaceValue: string) {

    if (El.childNodes.length > 0) {
      El.childNodes.forEach(node => {
        this.replaceRef(node as HTMLElement, sourceString, replaceValue);
      })
    }

    if (El.attributes && El.attributes.length > 0) {
      this.replaceAttrRef(El, sourceString, replaceValue);
    }

    if (El.nodeType !== 3) {
      return;
    }

    El.textContent = El.textContent.replace(new RegExp(`(?<=\{\x20*)${sourceString}?`, "g"), replaceValue);
  },
  replaceAttrRef(El: HTMLElement, sourceString: string, replaceValue: string) {
    if (El.attributes.length === 0) {
      return;
    }

    if (El.nodeType === 1 && this.buildInComponentTagNames.includes(El.tagName.toLowerCase())) {
      Array.from(El.attributes).reduce((prev, attrItem, index, attributes) => {
        if (prev.nodeName === "in" && attrItem.nodeName === sourceString) {
          prev.ownerElement.removeAttribute(attrItem.nodeName);
          prev.ownerElement.setAttribute(replaceValue, "");
        }
        return attrItem;
      })
    }
    for (const attrItem of Array.from(El.attributes)) {
      if (/(?<=\{\x20*).+?(?=\x20*\})/.test(attrItem.nodeValue)) {
        attrItem.nodeValue = attrItem.nodeValue.replace(new RegExp(`(?<=\{\x20*)${sourceString}`, "g"), replaceValue);
      }
    }

  },
  collectRef(El: IElement, rawData) {
    let ScopedElRefTree = {};

    if (El.__og_isCollected) {
      return ScopedElRefTree;
    }

    if (El.nodeType === 1 && this.buildInComponentTagNames.includes(El.tagName.toLowerCase())) {
      const tagName: string = El.tagName.toLowerCase();
      switch (tagName) {
        case "o-for":
          ScopedElRefTree = utils.objectAssign(ScopedElRefTree, this.handleOFor(El, rawData));
          break;
      }
    }

    if (El.childNodes && El.childNodes.length > 0) {
      for (const node of Array.from(El.childNodes)) {
        ScopedElRefTree = utils.objectAssign(ScopedElRefTree, this.collectRef(node as IElement, rawData));
      }
    }

    return ScopedElRefTree;
  },
  setUpdateView(target: IReactiveItem, propertys, property, value): Boolean {
    if (propertys.__og_fors) {
      return this.oForElUpdateView(...arguments);
    }
  },
  deleteUpdateView(target, refs, propertyKey): Boolean {
    if (refs.__og_fors) {
      return this.OForDeleteUpdateView(target, refs, propertyKey);
    }

    return true;
  },
  oForElUpdateView(target: IReactiveItem, propertys, property, value): Boolean {
    if (property === "length") {
      return;
    }
    const stateKey: string[] = parser.parseRefString(target['__og_stateKey']);
    const rawDataPart = Collect.getPropertyData(stateKey, target['__og_root'].data);
    const rawData = target.__og_root.data;

    if (!propertys[property]) {
      //* 已经是代理过了。 TODO：此处得优化
      if (rawDataPart[property].__og_root) {
        return;
      }
      let scopeRefTree = {};
      propertys.__og_fors.forEach(forItem => {
        const newEls = [];
        const propertyNames = parser.parseRefString(forItem.propertyName);
        forItem.templateChildNodes.forEach(node => {
          const newEl = node.cloneNode(true);
          this.replaceRef(newEl as HTMLElement, forItem.itemName, `${propertyNames.join(".")}.${property}`);
          newEls.push(newEl);
        });
        forItem.el.append(...newEls);

        forItem.el.__og_isCollected = false;

        const refTree = (plugin.use("CollectTagRefs") as IPluginItem).collectRef(forItem.el, rawData);

        const filterData = collect.filterHasRefData(refTree, rawData);

        OProxy.setProxy(rawData, filterData, [], target.__og_root);

        Parser.parseRef(refTree, rawData);

        scopeRefTree = utils.objectAssign(scopeRefTree, refTree);
      });
      target.__og_root.refs = utils.objectAssign(target.__og_root.refs, scopeRefTree);
    } else {
      const filterData = collect.filterHasRefData(target.__og_root.refs, target.__og_root.data);
      stateKey.push(property)
      const refTreePart = Collect.getProperty(stateKey, target.__og_root.refs);
      OProxy.setProxy(rawData, filterData, [], target.__og_root);
      updateTargetView(refTreePart, rawDataPart[property]);
    }
    return true;
  },
  OForDeleteUpdateView(target, refs, propertyKey) {
    const fors = refs.__og_fors;
    fors.forEach(forItem => {
      forItem.el.removeChild(forItem.el.children[propertyKey]);
    });
    return true;
  }
} as IPluginItem & {}
import { TPluginItem } from "../../types/Plugin";
import { defineOGProperty } from "../../Utils";
import { removeTargetRefTree } from "../../View";
import Reactive from "../index";

function collectElAttrRef(attrItem:Attr) {
  if (attrItem.ownerElement.nodeName !== "O-EL") return {};
  console.trace(attrItem.ownerElement);
  
  // defineOGProperty(target, {
  //   attrCollected: true,
  //   tagCollected: true
  // });
  // // let newElTagName: string = target.attrbutes['is'];
  // console.dir(target.attributes);

  return {};
}

function afterUpdateAttrRef(attrItem: Attr, properties): void {
  if (attrItem.ownerElement === null || attrItem.ownerElement.tagName !== "O-EL") return;

  switch (attrItem.nodeName) {
    case "html":
      attrItem.ownerElement.innerHTML = attrItem.nodeValue;
      break;
    case "value":
      removeTargetRefTree(attrItem.ownerElement, true);
      attrItem.ownerElement.innerHTML = attrItem.nodeValue;

      Reactive.collectEl(attrItem.ownerElement, properties, properties.__og__.reactive);
      break;
    case "is":
      // let ownerElement = attrItem.ownerElement;
      // let newEl = document.createElement(attrItem.nodeValue);
      // ownerElement.parentNode.insertBefore(newEl, ownerElement);
      break;
  }
}

export default {
  collectElAttrRef,
  afterUpdateAttrRef
} as TPluginItem
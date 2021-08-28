import { TPluginItem } from "../../types/Plugin";
import { defineOGProperty } from "../../Utils";
import { removeTargetRefTree } from "../../View";
import { getRefs } from "../Collect";
import Reactive from "../index";

function collectElAttrRef(attrItem: Attr) {
  if (attrItem.ownerElement.nodeName !== "O-EL") return {};
  if (attrItem.nodeName !== "is" || !attrItem.nodeValue) return {};
  console.log(getRefs(attrItem.nodeValue));


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
      if (attrItem.nodeValue) {
        // let ownerElement = attrItem.ownerElement;
        // let newEl = document.createElement(attrItem.nodeValue);
        // ownerElement.parentNode.insertBefore(newEl, ownerElement);
        // ownerElement.parentNode.removeChild(ownerElement);
      }
      break;
  }
}

export default {
  collectElAttrRef,
  afterUpdateAttrRef
} as TPluginItem
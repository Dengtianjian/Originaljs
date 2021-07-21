import { getPropertyData } from "../../Property";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils from "../../Utils";

const buildInTagName: string[] = ["o-for", "o-if"];

function handleOFor(target: HTMLElement, properties: IProperties): IRefTree {
  const attributes: Attr[] = Array.from(target.attributes);
  if (attributes.length === 0) return {};
  let InIndex: number = -1;
  let IndexName: string = "";
  let PropertyName: string = "";
  let KeyName: string = "";
  let ItemName: string = "";
  const childNodes: Node[] = [];
  target.childNodes.forEach(node => {
    childNodes.push(node.cloneNode(true));
  });

  attributes.forEach((attr, index) => {
    if (attr.nodeName === "in") {
      InIndex = index;
    }
  });

  PropertyName = attributes[InIndex + 1]['nodeName'];
  if (InIndex == 2) {
    IndexName = attributes[InIndex - 1]['nodeName'];
    ItemName = attributes[InIndex - 2]['nodeName'];
  } else if (InIndex == 3) {
    KeyName = attributes[InIndex - 1]['nodeName'];
    IndexName = attributes[InIndex - 2]['nodeName'];
    ItemName = attributes[InIndex - 3]['nodeName'];
  } else {
    ItemName = attributes[InIndex - 1]['nodeName'];
  }

  const property: IProperties = getPropertyData(PropertyName, properties);
  console.log(property);


  return {};
}

function collectRef(target: IEl, properties: IProperties): IRefTree {
  if (target.nodeType === 3 || target.__og__tagCollected) return {};

  let refTree = {};
  if (target.nodeType === 1 && buildInTagName.includes((target as HTMLElement).tagName.toLowerCase())) {
    switch ((target as HTMLElement).tagName.toLowerCase()) {
      case "o-for":
        refTree = Utils.objectAssign(refTree, handleOFor(target as HTMLElement, properties));
        break;
    }
  }

  if (target.childNodes.length > 0) {
    for (const key in target.childNodes) {
      if (target.childNodes.hasOwnProperty(key)) {
        refTree = Utils.objectAssign(refTree, collectRef(target.childNodes[key] as IEl, properties));
      }
    }
  }

  return refTree;
}

export default {
  collectRef
} as TPluginItem
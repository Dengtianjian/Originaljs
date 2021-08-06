import { setProxy } from "../../OGProxy";
import { propertyNamesToPath, transformPropertyName } from "../../Parser";
import { getPropertyData } from "../../Property";
import { Ref } from "../../Rules";
import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree, TRefTreeFors } from "../../types/Ref";
import Utils from "../../Utils";
import { deepUpdateRef } from "../../View";
import Collect from "../Collect";

function replaceRef(target: Node | HTMLElement, sourceString: string, replaceString: string): void {
  for (const nodeItem of Array.from(target.childNodes)) {
    replaceRef(nodeItem, sourceString, replaceString);
  }

  replaceAttrRef(target as HTMLElement, sourceString, replaceString);

  if (target.nodeType !== 3) return;
  const sourceStringRegExp: RegExp = new RegExp(`(?<=\x20*)${sourceString}?`, "g");

  target.textContent = target.textContent.replace(sourceStringRegExp, replaceString);
}

function replaceAttrRef(target: HTMLElement, sourceString: string, replaceString: string): void {
  if (target.nodeType !== 1 || target.attributes.length === 0) return;

  const attributes: Attr[] = Array.from(target.attributes);

  const testHasVariableRegExp: RegExp = new RegExp(Ref.variableItem, "g");
  const sourceStringRegExp: RegExp = new RegExp(`(?<=\x20*)${sourceString}?`, "g");

  attributes.reduce((prev, attrItem) => {
    if (testHasVariableRegExp.test(attrItem.nodeValue)) {
      attrItem.nodeValue = attrItem.nodeValue.replace(sourceStringRegExp, replaceString);
    }
    if (attrItem.nodeName === "in" && attrItem.nodeValue.indexOf(sourceString) > -1) {
      attrItem.nodeValue = attrItem.nodeValue.replace(sourceStringRegExp, replaceString);
    }
    return attrItem;
  }, attributes[0]);
}

function collectElRef(target: HTMLElement | Node[], properties: IProperties): IRefTree {
  let refTree: IRefTree = {};

  if (Array.isArray(target)) {
    for (const node of target) {
      Utils.objectAssign(refTree, collectElRef(node as HTMLElement, properties));
    }
    return refTree;
  }

  if (target.nodeType === 3 || target.__og__?.tagCollected) return refTree;
  if (target.tagName !== "O-FOR") return refTree;

  const attributes: Attr[] = Array.from(target.attributes);
  if (attributes.length === 0) return {};
  let InIndex: number = -1;
  let indexName: string = "";
  let propertyName: string = target.attributes['in'].nodeValue;
  let keyName: string = "";
  let itemName: string = "";
  const childNodes: Node[] = [];

  target.childNodes.forEach(node => {
    childNodes.push(node.cloneNode(true));
  });

  attributes.forEach((attr, index) => {
    if (attr.nodeName === "in") {
      InIndex = index;
    }
  });

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

  const propertyNames: string[] | number[] = transformPropertyName(propertyName);
  const property: IProperties = getPropertyData(propertyNames, properties);

  const newChildNodes: Array<Node[]> = [];

  let forIndex = 0;
  for (const key in property) {
    if (property.hasOwnProperty(key)) {
      const newEls: Node[] = [];
      propertyNames.push(key);
      const propertyNameSting: string = propertyNamesToPath(propertyNames);
      Array.from(childNodes).forEach((el, index) => {
        newEls.push(el.cloneNode(true));
        replaceRef(newEls[index], itemName, propertyNameSting);
      });
      propertyNames.pop();
      newChildNodes.push(newEls);
    }
    forIndex++;
  }
  target.textContent = "";

  newChildNodes.forEach(els => {
    target.append(...els);
  });

  return Utils.generateObjectTree(propertyNames, {
    __fors: [
      {
        el: target,
        templateChildNodes: childNodes,
        indexName,
        propertyName,
        keyName,
        itemName
      }
    ]
  } as IRefTree);
}
function setUpdateView(properties: IProperties, refTree: IRefTree, propertyKey: string, value: any): boolean {
  if (Array.isArray(properties) && propertyKey === "length" || refTree.__fors === undefined) return true;
  const fors: TRefTreeFors[] = refTree.__fors;
  const propertyNames: string[] = properties.__og__propertiesPath.split(".");
  propertyNames.push(propertyKey);
  const propertyNameSting: string = propertyNamesToPath(propertyNames);
  const partRefTree: IRefTree = {};

  for (const forItem of fors) {
    const newEls: Node[] = [];
    let forIndex = 0;

    forItem.templateChildNodes.forEach((el, index) => {
      newEls.push(el.cloneNode(true));
      replaceRef(newEls[index], forItem.itemName, propertyNameSting);
    });

    Utils.objectAssign(partRefTree, Collect.collection(newEls, properties.__og__reactive.properties));

    forItem.el.append(...newEls);
    forIndex++;
  }

  propertyNames.pop();
  Utils.objectAssign(properties.__og__reactive.refTree, partRefTree);
  setProxy(refTree, properties, properties.__og__reactive, propertyNames);
  deepUpdateRef(partRefTree, properties.__og__reactive.properties);
  return true;
}

export default {
  setUpdateView,
  collectElRef
} as TPluginItem
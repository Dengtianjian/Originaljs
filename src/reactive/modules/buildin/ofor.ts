import { setProxy } from "../../../OGProxy";
import { parseRef, transformPropertyName, transformValueToString } from "../../../Parser";
import Plugin from "../../../Plugin";
import { getPropertyData } from "../../../Property";
import { Ref } from "../../../Rules";
import { IEl } from "../../../types/ElementType";
import { IProperties } from "../../../types/Properties";
import { IRefTree, TRefTreeFors } from "../../../types/Ref";
import Utils from "../../../Utils";
import Collect from "../../Collect";

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

function handleOFor(target: HTMLElement, properties: IProperties): IRefTree {
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

  const newEls: Array<Node[]> = [];

  let forIndex = 0;
  for (const key in property) {
    if (property.hasOwnProperty(key)) {
      const newEl: Node[] = [...Array.from(childNodes)];
      propertyNames.push(key);
      const propertyNameSting: string = propertyNames.join(".")
      newEl.forEach((el, index) => {
        newEl[index] = el.cloneNode(true);
        replaceRef(newEl[index], itemName, propertyNameSting);
      });
      propertyNames.pop();
      newEls.push(newEl);
    }
    forIndex++;
  }
  target.textContent = "";

  newEls.forEach(els => {
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

function oForElUpdateView(properties: IProperties, refTree: IRefTree, propertyKey: string, value: any): boolean {
  if (propertyKey === "length") return true;
  const fors: TRefTreeFors[] = refTree.__fors;
  const propertyNames: string[] = transformPropertyName(properties.__og__propertiesPath);
  propertyNames.push(propertyKey);
  const propertyNameSting: string = propertyNames.join(".");

  for (const forItem of fors) {
    const newEl: Node[] = forItem.templateChildNodes;
    let forIndex = 0;

    newEl.forEach((el, index) => {
      newEl[index] = el.cloneNode(true);
      replaceRef(newEl[index], forItem.itemName, propertyNameSting);
    });

    // TODO 把index.ts的 三部曲封装成一个方法
    let partReftree: IRefTree = Collect.collection(newEl, properties.__og__reactive.properties);
    Utils.objectAssign(properties.__og__reactive.refTree, partReftree);

    parseRef(partReftree, properties.__og__reactive.properties);

    forItem.el.append(...newEl);
    forIndex++;
  }

  propertyNames.pop();
  setProxy(refTree, properties, properties.__og__reactive, propertyNames);

  return true;
}

export {
  handleOFor,
  oForElUpdateView
}
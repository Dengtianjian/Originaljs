import { transformPropertyName } from "../../../Parser";
import { getPropertyData } from "../../../Property";
import { Ref } from "../../../Rules";
import { IProperties } from "../../../types/Properties";
import { IRefTree } from "../../../types/Ref";

function replaceRef(target: Node | HTMLElement, sourceString: string, replaceString: string): void {
  for (const nodeItem of Array.from(target.childNodes)) {
    replaceRef(nodeItem, sourceString, replaceString);
  }

  replaceAttrRef(target as HTMLElement, sourceString, replaceString);

  if (target.nodeType !== 3) return;

  target.textContent = target.textContent.replace(new RegExp(`(?<=\{\x20*)${sourceString}?`), replaceString);
}

function replaceAttrRef(target: HTMLElement, sourceString: string, replaceString: string): void {
  if (target.nodeType !== 1 || target.attributes.length === 0) return;

  const attributes: Attr[] = Array.from(target.attributes);

  const testHasVariableRegExp: RegExp = new RegExp(Ref.variableItem, "g");

  attributes.reduce((prev, attrItem, index) => {
    if (testHasVariableRegExp.test(attrItem.nodeValue)) {
      attrItem.nodeValue = attrItem.nodeValue.replace(new RegExp(`(?<=\{\x20*)${sourceString}`, "g"), replaceString);
    }
    if (attrItem.nodeName === "in" && attrItem.nodeValue.indexOf(sourceString) > -1) {
      attrItem.nodeValue = attrItem.nodeValue.replace(new RegExp(`(?<=\x20*)${sourceString}?`), replaceString);
    }
    return attrItem;
  }, attributes[0]);
}

function handleOFor(target: HTMLElement, properties: IProperties): IRefTree {
  const attributes: Attr[] = Array.from(target.attributes);
  if (attributes.length === 0) return {};
  let InIndex: number = -1;
  let IndexName: string = "";
  let PropertyName: string = target.attributes['in'].nodeValue;
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

  const propertyNames: string[] | number[] = transformPropertyName(PropertyName);
  const property: IProperties = getPropertyData(propertyNames, properties);

  const newEls: Array<Node[]> = [];

  let forIndex = 0;
  for (const key in property) {
    if (property.hasOwnProperty(key)) {
      const newEl: Node[] = [...Array.from(childNodes)];
      newEl.forEach((el, index) => {
        newEl[index] = el.cloneNode(true);
        propertyNames.push(key);
        replaceRef(newEl[index], ItemName, propertyNames.join("."));
        propertyNames.pop();
      });
      newEls.push(newEl);
    }
    forIndex++;
  }
  target.textContent = "";

  newEls.forEach(els => {
    target.append(...els);
  });

  return {};
}

export {
  handleOFor
}
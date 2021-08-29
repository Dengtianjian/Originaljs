import { Ref } from "../../Rules";
import Transition from "../../transition";
import { IEl, IOGElement } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree, TAttr } from "../../types/Ref";

function addTransitions(target, rootEl): boolean {
  if ((target as HTMLElement).tagName !== "O-TRANSITION") return false;
  let tag: HTMLElement = target as HTMLElement;
  if (!tag.attributes['name']) return false;
  let transitionName: string = tag.attributes['name'].nodeValue;
  let transition: Transition = rootEl.__og__.transitions[transitionName];
  if (Ref.Item.test(transitionName)) return false;

  if (transition) {
    transition.els.push(tag);
    if (!Array.isArray(transition.updatePart)) transition.updatePart = [];
    transition.updatePart.push(tag);
  } else {
    rootEl.__og__.transitions[transitionName] = new Transition(tag);
    rootEl.__og__.transitions[transitionName]['updatePart'] = [tag];
  }
  return true;
}

export default {
  collectElRef(target: IEl, rootEl: IOGElement): IRefTree {
    addTransitions(target, rootEl);
    return {};
  },
  beforeUpdateAttrRef(attrItem: Attr, properties: IProperties) {
    let transitions = properties.__og__.transitions;

    if (attrItem.ownerElement === null || attrItem.ownerElement.tagName !== "O-TRANSITION") return;
    if (!transitions[attrItem.nodeValue]) return;
    let els = transitions[attrItem.nodeValue].els;
    els.splice(els.indexOf(attrItem.ownerElement), 1);
    return true;
  },
  afterUpdateAttrRef(attrItem: Attr, properties: IProperties) {
    if (attrItem.ownerElement === null || attrItem.ownerElement.tagName !== "O-TRANSITION") return;

    addTransitions(attrItem.ownerElement, properties.__og__.properties);
    return true;
  }
} as TPluginItem
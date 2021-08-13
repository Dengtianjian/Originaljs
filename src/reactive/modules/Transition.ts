import { Ref } from "../../Rules";
import Transition from "../../Transition";
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

  const children: HTMLElement[] = Array.from(tag.children) as HTMLElement[];

  if (transition) {
    transition.els.push(...children);
    if (transition.updatePart === null) {
      transition.updatePart = children;
    } else {
      transition.updatePart.push(...children);
    }
  } else {
    rootEl.__og__.transitions[transitionName] = new Transition(children);
    rootEl.__og__.transitions[transitionName]['updatePart'] = children;
  }
  return true;
}

export default {
  collectElRef(target: IEl, rootEl: IOGElement): IRefTree {
    addTransitions(target, rootEl);
    return {};
  },
  beforeUpdateRef(refTree: IRefTree, properties: IProperties) {
    if (!refTree.__attrs) return;
    let attrs: TAttr[] = refTree.__attrs;
    let transitions = properties.__og__.transitions;

    for (const attrItem of attrs) {
      if (attrItem.ownerElement.tagName !== "O-TRANSITION") continue;
      if (!transitions[attrItem.nodeValue]) continue;
      let els = transitions[attrItem.nodeValue].els;
      els.splice(els.indexOf(attrItem.ownerElement), 1);
    }
    return true;
  },
  afterUpdateRef(refTree: IRefTree, properties: IProperties) {
    if (!refTree.__attrs) return;
    let attrs: TAttr[] = refTree.__attrs;

    for (const attrItem of attrs) {
      if (attrItem.ownerElement.tagName !== "O-TRANSITION") continue;

      addTransitions(attrItem.ownerElement, properties.__og__.properties);
    }
    return true;
  }
} as TPluginItem
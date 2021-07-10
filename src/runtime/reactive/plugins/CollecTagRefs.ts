import { IElement } from "../../../types/elementType";
import { IPluginItem, TPropertys, TRefTree } from "../../../types/pluginType";
import { IReactiveItem } from "../../../types/reactiveType";
import plugin from "../../plugin";
import Collect from "../collect";
import parser from "../parser";
import { ExtractVariableName, VariableItem, VariableName } from "../rules";
import OProxy from "../oproxy";

function cleanRef(refTree) {
  if (typeof refTree === "object") {
    for (const key in refTree) {
      if (Object.prototype.hasOwnProperty.call(refTree, key)) {
        cleanRef(refTree[key]);
      }
    }
  }

  if (refTree.__els) {
    for (let index = 0; index < refTree.__els.length; index++) {
      refTree.__els[index].parentNode.removeChild(refTree.__els[index]);
      refTree.__els.splice(index, 1);
    }
  }
  if (refTree.__attrs) {
    for (let index = 0; index < refTree.__attrs.length; index++) {
      refTree.__attrs[index].ownerElement.removeAttribute(refTree.__attrs[index].nodeName);
      refTree.__attrs.splice(index, 1);
    }
  }
}

function deleteUpdateView(target: IReactiveItem, refs: TRefTree & TPropertys, propertyKey: PropertyKey): Boolean {
  propertyKey = String(propertyKey);
  const ref = refs[propertyKey];
  if (ref === undefined) {
    return true;
  }

  cleanRef(ref);

  delete ref[propertyKey];
  return true;
}

export default {
  collectTagRefs(El: IElement) {
    let ScopedElRefTree = {};

    if (El.__og_isCollected) {
      return ScopedElRefTree;
    }

    if (El.childNodes.length > 0) {
      for (const childNode of Array.from(El.childNodes)) {
        ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.collectTagRefs(childNode as IElement));
      }
    }

    if (El.attributes && El.attributes.length > 0) {
      ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, (plugin.use("CollectTagAttrRefs") as IPluginItem).collectRef(El, {}));
    }

    El.__og_isCollected = true;

    if (El.nodeType === 3) {
      let refs: RegExpMatchArray = El.textContent.match(new RegExp(VariableItem, "g"));

      if (refs === null) {
        return ScopedElRefTree;
      }
      const parentNode: HTMLElement = El.parentNode as HTMLElement;
      const appendTextEls: Text[] = [];

      for (let index = 0; index < refs.length; index++) {
        let variableName: unknown = refs[index].match(new RegExp(ExtractVariableName, "g"));

        if (variableName === null) {
          continue;
        }
        variableName = variableName[0];

        const prependText: string = El.textContent.slice(0, El.textContent.indexOf(`{${variableName}}`));
        if (prependText) {
          appendTextEls.push(document.createTextNode(prependText));
          El.textContent = El.textContent.slice(El.textContent.indexOf(`{${variableName}}`));
        }

        const refRawString: string = (variableName as string).trim();

        const newTextEl: Text = document.createTextNode("{" + refRawString + "}");
        const propertyNames: string[] = Collect.parsePropertyString(refRawString);
        ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, Collect.generateElRefTree(propertyNames, newTextEl));

        appendTextEls.push(newTextEl);

        const replaceRegString: string = "\{ *" + refRawString.replace(/([\.\[\]])/, "\\$1") + "? *\}";

        El.textContent = El.textContent.replace(new RegExp(replaceRegString), "");
      }
      appendTextEls.forEach(el => {
        parentNode.insertBefore(el, El);
      });
    }

    return ScopedElRefTree;
  },
  collectRef(El: IElement) {
    let ScopedElRefTree = {};

    if (El.__og_isCollected) {
      return ScopedElRefTree;
    }

    ScopedElRefTree = Collect.objectAssign(ScopedElRefTree, this.collectTagRefs(El));

    return ScopedElRefTree;
  },
  setUpdateView(target, propertys, property, value, rawData, paths = []) {
    if (propertys[property] !== undefined) {
      paths.push(target.__og_stateKey)

      OProxy.setProxy(target, propertys, paths, target.__og_root);
      const replaceValue: string = value.toString();
      if (propertys[property].__els) {
        const els: HTMLElement[] = propertys[property]['__els'];

        els.forEach(el => {
          el.textContent = replaceValue;
        });
      }
      if (propertys[property].__attrs) {
        const attrs: Attr[] = propertys[property]['__attrs'];

        attrs.forEach(attr => {
          attr.nodeValue = parser.parseString(attr.__og_attrs.rawNodeValue, rawData);
        });
      }
      if (typeof propertys[property] === "object" && target[property]) {
        for (const key in propertys[property]) {
          if (target[property][key] !== undefined) {
            this.setUpdateView(target[property], propertys[property], key, target[property][key], rawData, paths);
          }
        }
      }
    }
    return true;
  }
} as IPluginItem
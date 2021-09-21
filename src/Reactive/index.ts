import Module from "../Module";
import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefMap, TRefRecord } from "../Typings/RefTypings";
import Utils from "../Utils";
import AttrModule from "./Modules/AttrModule";
import ConditionElementModule from "./Modules/ConditionElementModule";
import DynamicElementModule from "./Modules/DynamicElementModule";
import ElementModule from "./Modules/ElementModule";
import ForElementModule from "./Modules/ForElementModule";
import MethodModule from "./Modules/MethodModule";
import TransitionElement from "./Modules/TransitionElement";
import PropertyProxy from "./PropertyProxy";
import Ref from "./Ref";

// Module.add("ConditionElement", ConditionElementModule);
// Module.add("ForElementModule", ForElementModule);
Module.add("MethodModule", MethodModule);
Module.add("TransitionElementModule", TransitionElement);
Module.add("DynamicElementModule", DynamicElementModule);
Module.add("ElementModule", ElementModule);
Module.add("AttrModule", AttrModule);

export default class Reactive {
  static observe(target: TElement | TElement[], properties: ICustomElement, reactiveInstance: Reactive) {
    const refRecord: TRefRecord = Ref.collectRef(target, properties, reactiveInstance);

    for (const key in refRecord) {
      if (reactiveInstance.refMap.has(key)) {
        Utils.objectMerge(reactiveInstance.refMap.get(key), refRecord[key]);
      } else {
        reactiveInstance.refMap.set(key, refRecord[key]);
      }
    }

    Ref.updateRefMap(refRecord, properties);
    PropertyProxy.setProxy(refRecord, properties, reactiveInstance);
  }
  refMap: TRefMap = new Map();
  constructor(target: TElement, public properties: ICustomElement) {
    let defineProperties: Record<string, any> = {
      reactive: this,
      refMap: this.refMap,
      propertiesKeyPath: [],
      properties,
    };
    Utils.defineOGProperty(properties, defineProperties);

    Reactive.observe(target, properties, this);
  }
}

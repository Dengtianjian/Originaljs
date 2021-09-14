import { ICustomElement, TElement } from "../Typings/CustomElementTypings";
import { TRefMap } from "../Typings/RefTypings";
import Utils from "../Utils";

export default class Reactive {
  static observe(target: TElement | TElement[], properties: ICustomElement, reactiveInstance: Reactive) {
    
  }
  refMap: TRefMap = new Map();
  constructor(target: TElement, properties: ICustomElement) {
    let defineProperties: Record<string, any> = {
      reactive: this,
      refMap: this.refMap,
      propertiesKeyPath: [],
      properties
    };
    Utils.defineOGProperty(properties, defineProperties);

    Reactive.observe(target, properties, this);
  }
}
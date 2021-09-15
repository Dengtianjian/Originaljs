import Reactive from ".";
import { ICustomElement } from "../Typings/CustomElementTypings";
import { TRefRecord } from "../Typings/RefTypings";

function setProxy(refRecord: TRefRecord, properties: ICustomElement, reactiveInstance: Reactive): void {}

export default {
  setProxy,
};

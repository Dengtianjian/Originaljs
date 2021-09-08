import { TElement } from "./Typings/CustomElementTypings";
import { ITransition, TCSSStyleDeclaration, TTransitionItem } from "./Typings/TransitionTypings";

export default class Transition implements ITransition {
  els: TElement[] = [];
  updatePart: TElement[] = [];
  transitions: TTransitionItem[] = [];
  currentRuningIndex: number = null;
  timer: number = null;
  updatedStyles: Set<string> = new Set();
  isClearStyles: boolean = false;
  endCallBack?: () => void;
  private batchChangeElStyle(els: TElement[] | HTMLCollection, properties: TCSSStyleDeclaration) {
    Array.from(els).forEach(el => {
      this.changeElStyle(el as HTMLElement, properties);
    });
  }
  private changeElStyle(target: HTMLElement, properties: TCSSStyleDeclaration) {
    for (const propertyName in properties) {
      this.updatedStyles.add(propertyName);
      target.style[propertyName] = properties[propertyName];
    }
  }
  private trigger() {
    if (this.transitions.length === 0 || this.els.length === 0) return;
    const transition: TTransitionItem = this.transitions[0];

    const updateEls: TElement[] = this.updatePart || this.els;
    const duration: number = parseFloat(transition.styles.transitionDuration);
    updateEls.forEach(elSet => {
      this.batchChangeElStyle(elSet.children, transition.styles);
    });

    this.timer = window.setTimeout(() => {
      this.transitions.shift();
      if (transition.callBack) transition.callBack();

      clearTimeout(this.timer);
      this.timer = null;
      if (this.transitions.length > 0) {
        this.trigger();
      } else {
        if (this.isClearStyles) {
          this.isClearStyles = false;
          const clearStyles: Record<string, any> = {};
          this.updatedStyles.forEach(item => {
            clearStyles[item] = "";
          });
          updateEls.forEach(elSet => {
            this.batchChangeElStyle(elSet.children, clearStyles);
          });
          this.updatedStyles.clear();
        }

        this.updatePart = null;
        clearTimeout(this.timer);

        if (this.endCallBack) this.endCallBack();
      }
    }, duration * 1000);
  }
  step(styles: TCSSStyleDeclaration, callBack?: () => void): this {
    this.transitions.push({
      styles,
      callBack
    });
    if (this.timer === null) this.trigger();
    return this;
  }
  end(endCallBack) {
    this.endCallBack = endCallBack;
    return this;
  }
  clear(isClear: boolean = true) {
    this.isClearStyles = isClear;
    return this;
  }
  continue() {
    this.trigger();
    return this;
  }
  stop() {
    clearTimeout(this.timer);
    return this;
  }
}
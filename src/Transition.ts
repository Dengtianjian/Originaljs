import { ICSSStyleDeclaration, ITransition, TTransitionItem } from "./types/TransitionType";

class Transition implements ITransition {
  els: HTMLElement[] & Element[] = null;
  updatePart: HTMLElement[] = null;
  private transitions: TTransitionItem[] = [];
  private RAFId: number = null;
  private startTimestamp: number = null;
  private endCallBack: () => void = null;
  private updatedStyles: Set<string> = new Set();
  private isClearStyle: boolean = false;
  constructor(el: HTMLElement | HTMLElement[]) {
    this.els = Array.isArray(el) ? el : [el];
  }
  private batchChangeElStyle(els: HTMLElement[], property: string | Record<string, any>, value?: any): void {
    els.forEach(el => {
      this.changeElStyle(el, property, value);
    });
  }
  private changeElStyle(target: HTMLElement, property: string | Record<string, any>, value?: any): void {
    if (typeof property === "string") {
      target.style[property] = value;
    } else {
      for (const propertyName in property) {
        this.updatedStyles.add(propertyName);
        target.style[propertyName] = property[propertyName];
      }
    }
  }
  private trigger(): void {
    if (this.transitions.length === 0 || this.els.length === 0) return;
    if (this.startTimestamp === null) this.startTimestamp = Date.now();

    const elapsed: number = Date.now() - this.startTimestamp; //* 过去多久时间了

    const transition: TTransitionItem = this.transitions[0];
    const updateEls: HTMLElement[] = this.updatePart ? this.updatePart : this.els;

    this.batchChangeElStyle(updateEls, {
      transitionProperty: Object.keys(transition.styles).join(","),
      transitionDuration: `${transition.duration}s`,
      transitionTimingFunction: transition.timingFunction,
      transitionDelay: `${transition.delay}s`,
      ...transition.styles
    });

    if (elapsed < transition.duration * 1000) {
      this.RAFId = window.requestAnimationFrame(this.trigger.bind(this));
    } else {
      this.transitions.shift();
      this.startTimestamp = null;

      if (transition.callBack) {
        transition.callBack();
      }
      if (this.transitions.length === 0) {
        let clearStyles: Record<string, any> = {
          transitionProperty: "",
          transitionDuration: "",
          transitionTimingFunction: "",
          transitionDelay: "",
        };
        if (this.isClearStyle) {
          for (const propertyName of this.updatedStyles.keys()) {
            clearStyles[propertyName] = "";
          }
          this.updatedStyles.clear();
          this.isClearStyle = false;
        }
        this.batchChangeElStyle(updateEls, clearStyles);
        this.updatePart = null;
        window.cancelAnimationFrame(this.RAFId);
        this.RAFId = window.requestAnimationFrame(() => {
          window.cancelAnimationFrame(this.RAFId);
          if (this.endCallBack) this.endCallBack();
        });
      }
    }
  }
  step(styles: ICSSStyleDeclaration, duration: number = 0.3, timingFunction: string = "linear", delay: number = 0, callBack?: () => void): this {
    this.transitions.push({
      styles,
      duration,
      timingFunction,
      delay,
      callBack
    });
    this.trigger();
    return this;
  }
  end(callBack: () => void): this {
    this.endCallBack = callBack;
    return this;
  }
  clear(isClear: boolean = true): this {
    this.isClearStyle = isClear;
    return this;
  }
}

export default Transition;
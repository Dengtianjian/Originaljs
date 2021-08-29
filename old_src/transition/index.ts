import { ICSSStyleDeclaration, ITransition, TTransitionItem } from "../types/TransitionType";

const presets: {
  [name: string]: {
    initStyle: ICSSStyleDeclaration,
    transitions: TTransitionItem[]
  }
} = {};

type TPresetReturn = {
  add(styles: ICSSStyleDeclaration, duration?: number, timingFunction?: string, delay?: number, callBack?: () => void): TPresetReturn
}

class Transition implements ITransition {
  els: HTMLElement[] & Element[] = null;
  updatePart: HTMLElement[] = null;
  transitions: TTransitionItem[] = [];
  private endCallBack: () => void = null;
  private updatedStyles: Set<string> = new Set();
  private isClearStyle: boolean = false;
  private runingTimer: number = null;
  constructor(el: HTMLElement | HTMLElement[]) {
    this.els = Array.isArray(el) ? el : [el];
  }
  static preset(name: string, initStyle: ICSSStyleDeclaration): TPresetReturn {
    presets[name] = {
      initStyle,
      transitions: []
    }
    return {
      add(styles: ICSSStyleDeclaration, duration: number = 0.3, timingFunction: string = "linear", delay: number = 0, callBack?: () => void) {
        presets[name].transitions.push({
          styles,
          duration,
          timingFunction,
          delay,
          callBack
        });
        return this;
      }
    }
  }
  static getPreset(name: string) {
    return presets[name];
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

    const transition: TTransitionItem = this.transitions[0];

    const updateEls: HTMLElement[] = this.updatePart ? this.updatePart : this.els;
    if (updateEls.length === 0) return;
    updateEls.forEach(els => {
      this.batchChangeElStyle(Array.from(els.children) as HTMLElement[], {
        transitionProperty: Object.keys(transition.styles).join(","),
        transitionDuration: `${transition.duration}s`,
        transitionTimingFunction: transition.timingFunction,
        transitionDelay: `${transition.delay}s`,
        ...transition.styles
      });
    })
    this.runingTimer = window.setTimeout(() => {
      this.transitions.shift();

      if (transition.callBack) transition.callBack();

      if (this.transitions.length > 0) {
        this.trigger();
      } else {
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
        clearTimeout(this.runingTimer);
        this.runingTimer = null;
        if (this.endCallBack) this.endCallBack();
      };
    }, transition.duration * 1000);
  }
 step(styles: ICSSStyleDeclaration, duration: number = 0.3, timingFunction: string = "linear", delay: number = 0, callBack?: () => void): this {
    this.transitions.push({
      styles,
      duration,
      timingFunction,
      delay,
      callBack
    });
    if (this.runingTimer === null) this.trigger();
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
  stop(): this {
    clearTimeout(this.runingTimer);
    this.runingTimer = null;
    this.transitions = [];
    return this;
  }
  continue(): this {
    // TODO 继续下一个过渡
    this.trigger();
    return this;
  }
}

export default Transition;
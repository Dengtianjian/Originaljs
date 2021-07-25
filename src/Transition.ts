import { ICSSStyleDeclaration, ITransition, TTransitionItem } from "./types/TransitionType";

class Transition implements ITransition {
  mutationDisabled: boolean = false;
  private els: HTMLElement[] & Element[] = null;
  private transitions: TTransitionItem[] = [];
  private RAFId: number = null;
  private startTimestamp: number = null;
  private endCallBack: () => void = null;
  private updatedStyles: Set<string> = new Set();
  private isClearStyle: boolean = false;
  constructor(el: HTMLElement | HTMLElement[]) {
    this.els = Array.isArray(el) ? el : [el];
  }
  private updateStyle(transitionItem: TTransitionItem): void {
    const stylePropertyNames: string[] = Object.keys(transitionItem.styles);
    this.els.forEach(el => {
      el.style.transitionProperty = stylePropertyNames.join(",");
      el.style.transitionDuration = `${transitionItem.duration}s`;
      el.style.transitionTimingFunction = transitionItem.timingFunction;
      el.style.transitionDelay = `${transitionItem.delay}s`;
    });
    for (const propertyName in transitionItem.styles) {
      const style: Record<string, string> = transitionItem.styles[propertyName];
      this.els.forEach(el => {
        el.style[propertyName] = style;
      });
      this.updatedStyles.add(propertyName);
    }
  }
  private trigger(): void {
    if (this.transitions.length === 0 || this.els.length === 0) return;
    if (this.startTimestamp === null) this.startTimestamp = Date.now();

    const elapsed: number = Date.now() - this.startTimestamp; //* 过去多久时间了

    const transition: TTransitionItem = this.transitions[0];
    this.updateStyle(transition);

    this.mutationDisabled = true; //* 过渡动画会触发MuataionObserver 让触发时 return;
    if (elapsed < transition.duration * 1000) {
      this.RAFId = window.requestAnimationFrame(this.trigger.bind(this));
    } else {
      this.transitions.shift();
      this.startTimestamp = null;

      if (transition.callBack) {
        transition.callBack();
      }
      if (this.transitions.length === 0) {
        this.els.forEach(el => {
          el.style.transitionProperty = "";
          el.style.transitionDuration = "";
          el.style.transitionTimingFunction = "";
          el.style.transitionDelay = "";
        });
        if (this.isClearStyle) {
          for (const propertyName of this.updatedStyles.keys()) {
            this.els.forEach(el => {
              el.style[propertyName] = "";
            });
          }
          this.updatedStyles.clear();
          this.isClearStyle = false;
        }
        window.cancelAnimationFrame(this.RAFId);
        this.RAFId = window.requestAnimationFrame(() => {
          window.cancelAnimationFrame(this.RAFId);
          this.mutationDisabled = false;
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
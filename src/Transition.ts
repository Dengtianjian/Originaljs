import { TElement } from "./Typings/CustomElementTypings";
import { ITransition, TCSSStyleDeclaration, TPreset, TPresetReturn, TTransitionItem } from "./Typings/TransitionTypings";

const Presets: Record<string, TPreset> = {};

export default class Transition implements ITransition {
  els: Set<TElement> = new Set();
  updatePart: Set<TElement> = new Set();
  transitions: TTransitionItem[] = [];
  currentRuningIndex: number = null;
  timer: number = null;
  updatedStyles: Record<string, string> = {};
  isClearStyles: boolean = false;
  endCallBack?: () => void;
  elKey?: string = null;
  static preset(name: string): TPresetReturn {
    Presets[name] = {
      transitions: []
    };
    const TransitionClass = this;
    return {
      add(styles: TCSSStyleDeclaration): TPresetReturn {
        TransitionClass.presetAddTransition(name, styles);
        return this;
      }
    }
  }
  static presetAddTransition(name: string, styles: TCSSStyleDeclaration, stepEndCallBack?: () => void) {
    Presets[name].transitions.push({
      styles,
      callBack: stepEndCallBack
    })
    return this;
  }
  static getPreset(name: string): TPreset {
    return Presets[name];
  }
  private batchChangeElStyle(els: TElement[] | HTMLCollection, properties: TCSSStyleDeclaration) {
    Array.from(els).forEach(el => {
      this.changeElStyle(el as HTMLElement, properties);
    });
  }
  private changeElStyle(target: HTMLElement, properties: TCSSStyleDeclaration) {
    for (const propertyName in properties) {
      this.updatedStyles[propertyName] = "";
      target.style[propertyName] = properties[propertyName];
    }
  }
  private clearElStyles(els: TElement[]): void {
    els.forEach(elSet => {
      this.batchChangeElStyle(elSet.children, this.updatedStyles);
    });
    this.updatedStyles = {};
  }
  private trigger() {
    if (this.transitions.length === 0 || this.els.size === 0) return;
    const transition: TTransitionItem = this.transitions[0];

    let updateEls: TElement[] = this.updatePart ? Array.from(this.updatePart) : Array.from(this.els);
    const duration: number = parseFloat(transition.styles.transitionDuration);

    if (this.elKey) {
      updateEls = updateEls.filter(transitionEl => {
        return transitionEl.attributes['key'] && transitionEl.attributes['key'].nodeValue === this.elKey;
      });
    }

    updateEls.forEach(elSet => {
      this.batchChangeElStyle(elSet.children, transition.styles);
    });

    this.timer = window.setTimeout(() => {
      this.transitions.shift();
      if (transition.callBack) transition.callBack();

      clearTimeout(this.timer);
      this.timer = null;
      if (this.transitions.length > 0) {
        this.clearElStyles(updateEls);
        this.trigger();
      } else {
        if (this.isClearStyles) {
          this.isClearStyles = false;
          this.clearElStyles(updateEls);
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
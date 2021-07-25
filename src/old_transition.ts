import { Query } from "./selector";
import { ITransitionProperty, ITrantionItem } from "./types/transitionTypes";

class OTransition {
  private $el: null | HTMLElement = null;
  private transitions: ITrantionItem[] = [];
  private RAFId: number | null = null;
  private startTimestamp: number | null = null;
  private endCallBack: () => void | null = null;
  private insertedPropertyNames: Set<string> = new Set();
  private isCleanStyle: boolean = false;
  private updateStyle(transitionItem: ITrantionItem): void {
    const PropertyNames: string[] = Object.keys(transitionItem.propertys);
    this.$el.style.transitionProperty = PropertyNames.join(",");
    this.$el.style.transitionDuration = `${transitionItem.duration}s`;
    this.$el.style.transitionTimingFunction = transitionItem.timingFunction;
    for (const propertyName in transitionItem.propertys) {
      if (
        Object.prototype.hasOwnProperty.call(
          transitionItem.propertys,
          propertyName
        )
      ) {
        const transition = transitionItem.propertys[propertyName];
        this.$el.style[propertyName] = transition;
        this.insertedPropertyNames.add(propertyName);
      }
    }
  }
  private trigger(): void {
    if (this.startTimestamp === null) {
      this.startTimestamp = Date.now();
    }
    const elapsed = Date.now() - this.startTimestamp;
    const transition = this.transitions[0];
    this.updateStyle(transition);

    if (elapsed < transition.duration * 1000) {
      this.RAFId = window.requestAnimationFrame(this.trigger.bind(this));
    } else {
      this.transitions.shift();
      this.startTimestamp = null;
      if (transition.callback) {
        transition.callback();
      }

      if (this.isCleanStyle) {
        for (const propertyName of this.insertedPropertyNames.keys()) {
          this.$el.style[propertyName] = "";
        }
        this.insertedPropertyNames.clear();
        this.isCleanStyle = false;
      }
      window.cancelAnimationFrame(this.RAFId);
      this.RAFId = window.requestAnimationFrame(this.trigger.bind(this));
      if (this.transitions.length === 0) {
        window.cancelAnimationFrame(this.RAFId);
        this.$el.style.transitionProperty = "";
        this.$el.style.transitionDuration = "";
        this.$el.style.transitionTimingFunction = "";
        if (this.endCallBack) {
          this.endCallBack();
        }
      }
    }
  }
  el(selector, rootEl = null): this {
    if (this.$el === null) {
      this.$el = Query(selector, rootEl);
    }

    return this;
  }
  step(
    propertys: ITransitionProperty,
    duration: number = 0.3,
    timingFunction: string = "linear",
    callback?: () => void
  ): this {
    this.transitions.push({
      propertys,
      duration,
      timingFunction,
      callback,
    });
    this.trigger();
    return this;
  }
  end(callback: () => void): this {
    this.endCallBack = callback;
    return this;
  }
  clear(): this {
    this.isCleanStyle = true;
    return this;
  }
}

export default OTransition;
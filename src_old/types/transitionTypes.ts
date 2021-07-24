export interface ITransitionProperty {
  [key: string]: number | string;
}

export interface ITrantionItem {
  propertys: ITransitionProperty;
  duration?: number;
  timingFunction?: string;
  callback(): void;
}

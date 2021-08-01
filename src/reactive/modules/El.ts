import { IEl } from "../../types/ElementType";
import { TPluginItem } from "../../types/Plugin";
import { IRefTree } from "../../types/Ref";

export default {
  collectElRef(target: IEl | Node[], properties): IRefTree {
    console.log(target);
    
    return {};
  }
} as TPluginItem
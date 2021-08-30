import { TModuleOptions } from "../../Typings/ModuleTypings";

export default {
  reactive: {
    start() {
      console.log("start");
    },
    collectRef() {
      console.log(arguments);
      return {};
    },
    collecElRef() {
      console.log("collectElRef", arguments);
      return {};
    }
  }
} as TModuleOptions
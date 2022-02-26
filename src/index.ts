import Element from "./Element";
import Module from "./Reactive/Module";
import El from "./Reactive/Modules/El";
import For from "./Reactive/Modules/For";
import Style from "./Reactive/Modules/Style";

Module.add(Style);
Module.add(For);
Module.add(El);

export default {
  ...Element
}
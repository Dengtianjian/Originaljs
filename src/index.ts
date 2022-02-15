import Element from "./Element";
import Module from "./Reactive/Module";
import El from "./Reactive/Modules/El";
import For from "./Reactive/Modules/For";

Module.add("For", For);
Module.add("El", El);

export default {
  ...Element
}
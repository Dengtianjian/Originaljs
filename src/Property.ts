import { transformPropertyName } from "./Parser";
import { IProperties } from "./types/Properties";

export function getPropertyData(propertyNames: string[] | string, properties: IProperties): any {
  if (typeof propertyNames === "string") {
    propertyNames = transformPropertyName(propertyNames);
  }
  let property: any = properties;
  for (const name of propertyNames) {
    property = property[name];
    if (property === undefined) {
      console.warn(`undefined reactive variables: ${name} . Path:${propertyNames.join("-> ")}.`);
      break;
    }
  }
  return property;
}
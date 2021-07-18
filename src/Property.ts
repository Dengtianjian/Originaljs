import { IProperties } from "./types/Properties";

export function getPropertyData(propertyNames: string[], properties: IProperties): any {
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
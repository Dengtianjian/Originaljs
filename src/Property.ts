import { transformPropertyName } from "./Parser";
import { IProperties } from "./types/Properties";

export function getPropertyData(propertyNames: string[] | number[] | string | number, properties: IProperties): any {
  if (typeof propertyNames === "string") {
    propertyNames = transformPropertyName(propertyNames);
  }
  let property: any = properties;
  for (const name of propertyNames as string[] | number[]) {
    property = property[name];
    if (property === undefined) {
      console.warn(`undefined reactive variables: ${name} . Path:${(propertyNames as string[] | number[]).join("-> ")}.`);
      property = "";
      break;
    }
  }

  return property;
}
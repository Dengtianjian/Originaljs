import { RefRules } from "./Rules";
import Transform from "./Transform";
const matchRefItem: RegExp = new RegExp(RefRules.keyItem, "g");
const matchAndExtract: RegExp = new RegExp(RefRules.extractItem, "g");
const matchAndExtractVariableName: RegExp = new RegExp(RefRules.extractVariableName, "g");

function getRefKey(sourceString: string, extract: boolean = true): string[] {
  let refs: string[] = sourceString.match(extract ? matchAndExtract : matchRefItem) || [];

  return refs.map(refItem => {
    return refItem.trim();
  });
}

function collecRef(sourceString: string): string[][] {
  let refs: string[] | string[][] = sourceString.match(matchAndExtractVariableName) || [];

  refs = refs.map(refItem => {
    return Transform.transformPropertyNameToArray(refItem);
  });

  return refs;
}

export default {
  collecRef,
  getRefKey
}
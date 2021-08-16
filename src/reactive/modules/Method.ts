import { executeExpression } from "../../Expression";
import { elBindMethod } from "../../Method";
import { OGElement } from "../../OGElement";
import { transformPropertyName } from "../../Parser";
import { getPropertyData } from "../../Property";
import { Methods, Ref } from "../../Rules";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils, { deepSetObjectPropertyValue, generateObjectTree } from "../../Utils";
import { getRefs } from "../Collect";

export default {
  collectElAttrRef(attrItem: Attr, properties: IProperties): IRefTree {
    let target = attrItem.ownerElement;
    if (target === null) return {};
    if (Methods.OnAttributeName.test(attrItem.name) === false || Methods.MethodNameAttibuteValue.test(attrItem.value) === false) return {};
    const methodNames: RegExpMatchArray = String(attrItem.value).match(new RegExp(Methods.MatchMethodName, "g"));

    if (methodNames === null) return {};
    //* 清除已有方法
    target[attrItem.name] = null;

    const refTree: IRefTree = {};
    const refNames: string[][] = [];

    for (const methodNameItem of methodNames) {
      let params: Array<string | HTMLElement | Element | OGElement> = [];
      let listener = null;

      const paramsRawString: RegExpMatchArray = methodNameItem.match(Methods.MethodParams);
      if (paramsRawString) {
        let rawStrings: string[] | number[] = paramsRawString[0].split(",");
        for (let index = 0; index < rawStrings.length; index++) {
          let item = rawStrings[index];
          if (isNaN(Number(item))) {
            if (/^['"].+['"]$/.test(item)) {
              item = rawStrings[index] = item.replace(/^['"](.+)['"]$/, "$1");
            }

            if (Ref.Item.test(item)) {
              let refs: string[] = getRefs(item);

              refs.forEach(refItem => {
                rawStrings[index] = executeExpression(item, properties);
                let names: string[] = transformPropertyName(refItem);
                refNames.push(names);

                Utils.objectAssign(refTree, generateObjectTree(names, {}));
              })
            }

          } else {
            rawStrings[index] = Number(item);
          }
        }
        params = rawStrings;
      }

      const methodName: RegExpMatchArray = methodNameItem.match(Methods.MethodName);
      if (methodName === null) continue;
      if (!properties[methodName[0]]) {
        console.warn(`缺失 ${methodName[0]} 方法`);
        continue;
      }

      const type: RegExpMatchArray = attrItem.name.match(new RegExp(Methods.MethodType, "g"));
      if (type === null) continue;

      listener = (event) => {
        properties[methodName[0]].apply(target, [...params, event, target]);
      };
      if (refNames.length > 0) {
        deepSetObjectPropertyValue(refTree, refNames[0], {
          __methods: [
            {
              paramsRawString: paramsRawString[0],
              listener,
              params
            }
          ]
        });
      }

      target.addEventListener(type[0], listener);
    }
    target.removeAttribute(attrItem.name);

    return refTree;
  },
  // setUpdateView()
} as TPluginItem
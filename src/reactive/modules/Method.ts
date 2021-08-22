import { executeExpression } from "../../Expression";
import { elBindMethod } from "../../Method";
import { OGElement } from "../../OGElement";
import { transformPropertyName } from "../../Parser";
import { getPropertyData } from "../../Property";
import { Methods, Ref } from "../../Rules";
import { TPluginItem } from "../../types/Plugin";
import { IProperties } from "../../types/Properties";
import { IRefTree } from "../../types/Ref";
import Utils, { deepSetObjectPropertyValue, defineOGProperty, generateObjectTree } from "../../Utils";
import { getRefs } from "../Collect";

function parseParamsString(paramsString: string, properties: IProperties): Array<any> {
  let params: Array<string | HTMLElement | Element | OGElement> = [];
  const paramsRawString: RegExpMatchArray = paramsString.match(Methods.MethodParams);

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

  return params;
}

export default {
  collectElAttrRef(attrItem: Attr, properties: IProperties): IRefTree {
    if (attrItem.ownerElement.__og__ && attrItem.ownerElement.__og__.skipCollect) {
      return {};
    }

    let target = attrItem.ownerElement;
    if (target === null) return {};
    if (Methods.OnAttributeName.test(attrItem.name) === false || Methods.MethodNameAttibuteValue.test(attrItem.value) === false) return {};
    const methodNames: RegExpMatchArray = String(attrItem.value).match(new RegExp(Methods.MatchMethodName, "g"));
    const eventType: RegExpMatchArray = attrItem.nodeName.match(Methods.MethodType);
    if (eventType === null) return {};

    if (methodNames === null) return {};
    //* 清除已有方法
    target[attrItem.name] = null;

    const refTree: IRefTree = {};
    const refNames: string[][] = [];

    for (const methodNameItem of methodNames) {
      let params: Array<string | HTMLElement | Element | OGElement> = [];
      let listener = null;

      const paramsRawString: RegExpMatchArray = methodNameItem.match(Methods.MethodParams);

      // TODO：抽取代码
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
              params,
              target,
              type: eventType[0],
              methodName: methodName[0]
            }
          ],
          __has: true
        });
      }

      target.addEventListener(type[0], listener);
    }
    target.removeAttribute(attrItem.name);

    return refTree;
  },
  afterUpdateRef(refTree: IRefTree, properties: IProperties, propertyName: string): boolean {
    if (refTree.__methods === undefined) return;
    const methodRefs: Array<any> = refTree.__methods;

    for (const methodItem of methodRefs) {
      if (properties[methodItem.methodName] === undefined || typeof properties[methodItem.methodName] !== "function") continue;

      let rawStrings: string[] | number[] = methodItem.paramsRawString.split(",");
      for (let index = 0; index < rawStrings.length; index++) {
        let item = rawStrings[index];
        if (isNaN(Number(item))) {
          if (/^['"].+['"]$/.test(item)) {
            item = rawStrings[index] = item.replace(/^['"](.+)['"]$/, "$1");
          }

          if (Ref.Item.test(item)) {
            let refs: string[] = getRefs(item);

            refs.forEach(refItem => {
              if (Ref.ExpressionItem.test(item)) {
                rawStrings[index] = executeExpression(item, properties);
              } else {
                let data = getPropertyData(refItem, properties);
                if (data.__og__) {
                  rawStrings[index] = Utils.deepCopy(data);
                } else {
                  rawStrings[index] = data;
                }
              }
            });
          }

        } else {
          rawStrings[index] = Number(item);
        }
      }
      methodItem.params = rawStrings;

      let listener = function () {
        properties[methodItem.methodName].apply(methodItem.target, methodItem.params);
      };

      (methodItem.target as HTMLElement).removeEventListener(methodItem.type, methodItem.listener);
      methodItem['listener'] = listener;
      (methodItem.target as HTMLElement).addEventListener(methodItem.type, listener)
    }

    return true;
  }
} as TPluginItem
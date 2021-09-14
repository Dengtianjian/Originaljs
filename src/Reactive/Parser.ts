/**
 * 转换HTML文本为标签节点数组
 * @param HTMLString HTML文本
 * @returns 标签节点数组
 */
function parseDom(HTMLString: string): Node[] {
  const document: Document = new DOMParser().parseFromString(HTMLString, "text/html");

  return [
    ...Array.from(document.head.childNodes),
    ...Array.from(document.body.childNodes)
  ];
}

/**
 * 优化HTML模板字符串里的ref引用key，主要是为了解决在img标签src属性下带有 . 的引用，为编译完模板时会报url错误问题
 * @param sourceString HTML模板字符串
 * @returns 优化后的字符串
 */
function optimizeRefKey(sourceString: string): string {
  return sourceString.replaceAll(/\.([\w\d_]+)?/g, "['$1']");
}

/**
 * 转换HTML模板字符串为节点数组
 * @param template HTML模板字符串
 * @returns 节点数组
 */
function parseTemplate(template: string | Element | Node[] | NodeList): Node[] {
  if (template === null) return [];

  if (typeof template === "string") {
    template = parseDom(optimizeRefKey(template));
  } else if (template instanceof Element) {
    template.innerHTML = optimizeRefKey(template.innerHTML);
    template = [template];
  } else if (template instanceof NodeList) {
    template = Array.from(template);
    (template as HTMLElement[]).forEach(nodeItem => {
      if (nodeItem.nodeType !== 3) {
        nodeItem.innerHTML = optimizeRefKey(nodeItem.innerHTML);
      }
    });
  }

  return template;
}

/**
 * 解析方法参数字符串
 * @param paramString 参数字符串
 * @returns 解析后的参数字符串数组
 */
function parseMethodParams(paramString: string): string[] {
  const params: any[] = paramString.split(",").map(param => {
    if (isNaN(Number(param))) {
      return param;
    } else {
      return Number(param);
    }
  })

  return params;
}

/**
 * 解析模板中的表达式
 * @param template 模板字符串
 * @returns 模板中大括号的表达式
 */
function parseExpression(template: string): string[] {
  const refs: string[] = [];

  let isAround: number = 0;
  const startIndex: number = template.indexOf("{");
  let refFramge: string = "{";
  for (let index = startIndex; index < template.length; index++) {
    const character: string = template[index];
    if (isAround > 0) {
      refFramge += character;
    }
    switch (character) {
      case "{":
        isAround++;
        break;
      case "}":
        isAround--;
        if (isAround < 0) {
          throw new Error("Syntax error");
        }
        if (isAround === 0) {
          refs.push(refFramge);
          refFramge = "{";
        }
        break;
    }
  }
  if (isAround > 0) {
    throw new Error("Syntax error");
  }

  return refs;
}

export default {
  parseDom,
  optimizeRefKey,
  parseTemplate,
  parseMethodParams,
  parseExpression
}
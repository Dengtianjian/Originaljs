import RegExpRules from "../RegExpRules";
import { TStatement } from "../Typings/RefType";
import Obj from "../Utils/Obj";
import Transform from "./Transform";

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
 * 优化HTML模板字符串里的ref引用key，主要是为了解决在img标签src属性下带有 . 的引用，未编译完模板时会报url错误问题
 * @param sourceString HTML模板字符串
 * @returns 优化后的字符串
 */
function optimizeRefKey(sourceString: string): string {
  return sourceString.replaceAll(/(?<=\{[ \w_\.\[\]"']*)\.([\w_]+)/g, "['$1']");
}

const emptyConditions: string[] = ["{}", ""];
function filterEmptyValue(values: string[]): string[] {
  return values.filter(item => !emptyConditions.includes(item));
}

/**
 * 解析模板并且获取表达式插值
 * @param {String} template 模板HTML
 * @returns 表达式相关
 */
function parseTemplateToStatement(template: string): TStatement {
  let charts: string[] = template.split("");
  const statements: string[] = [];
  const statementsRaw: string[] = [];
  const refs: string[] = [];
  const refsRaw: string[] = [];
  const executableStatements: Map<string, string> = new Map();
  const statementRefsMap: Map<string, string[]> = new Map<string, string[]>();
  const statementRawMap: Map<string, string> = new Map<string, string>();
  const refKeyMap: Map<string, string> = new Map<string, string>();
  const refKeysMap: Map<string, string[]> = new Map<string, string[]>();

  let inBlockCount: number = 0; //* 进入 块级的次数，解析完后需要为0，否则就是插值语法错误
  let executableStatement: string = ""; //* 可执行块级语句字符串，引用的数据加了this后的语句
  let blockStatementRaw: string = ""; //* 解析出来的块级语句原始字符串，也就是插值、模板语法
  let statement: string = ""; //* 块级语句字符串，未加this
  let statementRefs: string[] = []; //* 语句里的数据引用
  let statementFragment: string = ""; //* 块级内的语句片段
  let errorStatement: string = "" //* 错误语法的语句
  let rawRefKeys: string[] = []; //* 插值引用原字符串 就是抽取并且解析之前

  for (const chartItem of charts) {
    switch (chartItem) {
      case "{":
        blockStatementRaw += chartItem;
        if (inBlockCount > 0) {
          statementFragment = "";
          statementFragment += chartItem;
          statement += chartItem;
          executableStatement += chartItem;
        }

        inBlockCount++;
        break;
      case "}":
        inBlockCount--;

        statementFragment += chartItem;
        blockStatementRaw += chartItem;

        if (inBlockCount !== 0) {
          executableStatement += chartItem;
          statement += chartItem;
        }
        if (RegExpRules.matchRefRaw.test(statementFragment)) {
          refsRaw.push(statementFragment);
          const extractRef: string = statementFragment.replace(RegExpRules.extactRef, "$1").trim();
          statementRefs.push(extractRef);
          rawRefKeys.push(statementFragment);

          executableStatement = executableStatement.replace(statementFragment, `this.${extractRef}`);

          refKeyMap.set(statementFragment, extractRef);
          refKeysMap.set(statementFragment, Transform.transformPropertyKey(extractRef));
        }

        if (inBlockCount === 0) {
          blockStatementRaw = blockStatementRaw.trim();
          statement = statement.trim();

          statementsRaw.push(blockStatementRaw);
          statements.push(statement);
          refs.push(...statementRefs);

          if (executableStatement === "") {
            executableStatement = statement;
          }
          executableStatements.set(blockStatementRaw, executableStatement.trim());
          statementRawMap.set(blockStatementRaw, statement);
          statementRefsMap.set(blockStatementRaw, [...rawRefKeys]);

          executableStatement = "";
          blockStatementRaw = "";
          statementRefs = [];
          rawRefKeys = [];
          statement = "";
        }

        statementFragment = "";
        break;
      default:
        statementFragment += chartItem;
        statement += chartItem;
        executableStatement += chartItem;
        errorStatement += chartItem;
        blockStatementRaw += chartItem;
        break;
    }
  }
  if (inBlockCount > 0 || inBlockCount < 0) {
    throw new Error(`${errorStatement}，插值语法错误`);
  }

  return {
    raw: template,
    refs: filterEmptyValue(refs),
    refsRaw: filterEmptyValue(refsRaw),
    statements: filterEmptyValue(statements),
    statementsRaw: filterEmptyValue(statementsRaw),
    executableStatements,
    statementRefsMap,
    statementRawMap,
    refKeyMap,
    refKeysMap
  };
}

export default {
  optimizeRefKey,
  parseDom,
  parseTemplateToStatement
}
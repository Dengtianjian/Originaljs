import Collect from "./collect";

function parseRef(refTree: object, rawData: object, path: string[] = []) {
  for (const branchName in refTree) {
    if (Object.prototype.hasOwnProperty.call(refTree, branchName)) {
      if (rawData[branchName]) {
        if (typeof rawData[branchName] === "object") {
          path.push(branchName);
          replaceRefContent(refTree, rawData, branchName, path);
          parseRef(refTree[branchName], rawData[branchName], path);
          path.pop();
        } else {
          replaceRefContent(refTree, rawData, branchName, path);
        }
      }
    }
  }
}

function replaceRefContent(refTree, rawData, branchName, path) {
  const replaceValue: string = rawData[branchName].toString();
  if (refTree[branchName]['__els'] && refTree[branchName]['__els'].length > 0) {
    refTree[branchName]['__els'].forEach(el => {
      el.textContent = replaceValue;
    })
  }
  if (refTree[branchName]['__attrs'] && refTree[branchName]['__attrs'].length > 0) {
    const attrs: Attr[] = refTree[branchName]['__attrs'];
    for (const attr of attrs) {
      let refs = attr.nodeValue.match(/(?<=\{\x20*).+?(?=\x20*\})/g);
      if (refs === null) {
        continue;
      }
      path.push(branchName);
      let pathString: string = path.join(".");
      refs.forEach(ref => {
        const propertyStrings: string[] = Collect.parsePropertyString(ref);
        if (pathString === propertyStrings.join(".")) {
          let replaceSource = ref.replace(/([\[\]\.])/g, "\\$1");
          attr.nodeValue = attr.nodeValue.replace(new RegExp(`\{\x20*${replaceSource}\x20*\}`, "g"), replaceValue);
        }
      })
      path.pop();
    }
  }
}

export default {
  parseRef,
  replaceRefContent
}
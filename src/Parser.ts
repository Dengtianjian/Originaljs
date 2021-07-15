export function parseDom(DOMString): Node[] {
  const DP: DOMParser = new DOMParser();
  const document: Document = DP.parseFromString(DOMString, "text/html");
  const headChildNodes: NodeListOf<ChildNode> =
    document.childNodes[0].childNodes[0].childNodes;
  const bodyChildNodes: NodeListOf<ChildNode> =
    document.childNodes[0].childNodes[1].childNodes;
  const nodes: Node[] = [
    ...Array.from(headChildNodes),
    ...Array.from(bodyChildNodes)
  ];
  return nodes;
}
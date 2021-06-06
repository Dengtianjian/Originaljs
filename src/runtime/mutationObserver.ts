export function ObserverNode(
  target: Node,
  callback: (mutations: MutationRecord[], observer: MutationObserver) => void,
  options: MutationObserverInit = {
    attributes: true,
  }
): MutationObserver {
  const mt = new MutationObserver((mutations, observer) => {
    callback(mutations, observer);
  });

  mt.observe(target, options);
  return mt;
}

export function ObserverNodeAttributes(
  target: Node,
  attributeFilter: string[] | string,
  calback: (mutations: MutationRecord[], observer: MutationObserver) => void
): MutationObserver {
  attributeFilter =
    typeof attributeFilter === "string" ? [attributeFilter] : attributeFilter;
  return ObserverNode(target, calback, {
    attributeFilter,
  });
}

export default {
  ObserverNode,
  ObserverNodeAttributes,
};

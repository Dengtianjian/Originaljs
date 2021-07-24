export function Query(selectors, rooEl = null) {
  if (rooEl) {
    return rooEl.querySelector(selectors);
  }
  return document.querySelector(selectors);
}

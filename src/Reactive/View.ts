function updateView() {

}

function setUpdateView(target: any, propertyKey: string | symbol, value: any, receiver: any): boolean {
  return true;
}

function deleteUpdateView(target: any, propertyKey: string | symbol): boolean {
  return true;
}

export default {
  updateView,
  setUpdateView,
  deleteUpdateView
}
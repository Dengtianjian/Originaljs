function throwError(message: string): void {
  throw new Error(message);
}

function warning(message: string): void {
  console.warn(message);
}

export default {
  throwError,
  warning
}
function throwError(message: string): void {
  throw new Error(message);
}

function warning(message: string): void {
  console.warn(message);
}

function error(message: string): void {
  console.error(message);
}

export default {
  throwError,
  warning,
  error
}
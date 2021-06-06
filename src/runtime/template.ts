export async function importTemplate(filePath: string): Promise<string> {
  const template: {
    default: string;
  } = await import(filePath);
  return template.default;
}

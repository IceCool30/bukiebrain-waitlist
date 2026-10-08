import { readdir } from "node:fs/promises";
import path from "node:path";

export async function findMockupFiles(root: string, directory = root): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(
    entries
      .filter(({ name }) => !name.startsWith("_") && !name.startsWith("."))
      .map(async (entry) => {
        const absolutePath = path.join(directory, entry.name);
        if (entry.isDirectory()) return findMockupFiles(root, absolutePath);
        if (!entry.isFile() || !entry.name.endsWith(".tsx")) return [];
        return [path.relative(root, absolutePath).split(path.sep).join("/")];
      }),
  );

  return files.flat().sort();
}

import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { findMockupFiles } from "./mockupFiles.ts";

test("returns sorted TSX paths and skips private entries", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockups-"));

  try {
    await mkdir(path.join(root, "nested"));
    await mkdir(path.join(root, "_private"));
    await mkdir(path.join(root, ".hidden"));
    await writeFile(path.join(root, "B.tsx"), "");
    await writeFile(path.join(root, "nested", "A.tsx"), "");
    await writeFile(path.join(root, "_private", "Hidden.tsx"), "");
    await writeFile(path.join(root, "_draft.tsx"), "");
    await writeFile(path.join(root, ".hidden", "Hidden.tsx"), "");
    await writeFile(path.join(root, "notes.md"), "");

    assert.deepEqual(await findMockupFiles(root), ["B.tsx", "nested/A.tsx"]);
    assert.deepEqual(await findMockupFiles(path.join(root, "missing")), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

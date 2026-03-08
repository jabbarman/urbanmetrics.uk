import { promises as fs } from "node:fs";
import path from "node:path";

import type { CatalogEntry, GeneratedLayer, GeneratedStatus } from "@/server/datasets/types";

const generatedDir = path.join(process.cwd(), "data", "generated");

async function readJsonFile<T>(filePath: string) {
  const file = await fs.readFile(filePath, "utf8");
  return JSON.parse(file) as T;
}

export async function loadCatalog() {
  return readJsonFile<CatalogEntry[]>(path.join(generatedDir, "catalog.json"));
}

export async function loadLayer(layerId: string) {
  return readJsonFile<GeneratedLayer>(path.join(generatedDir, "layers", `${layerId}.json`));
}

export async function loadStatus() {
  return readJsonFile<GeneratedStatus>(path.join(generatedDir, "status.json"));
}

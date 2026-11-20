import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

function main() {
  const appDir = join(repoRoot, "app");
  const shotsDir = join(repoRoot, "screenshots");
  if (!existsSync(appDir)) throw new Error("app/ not found in " + repoRoot);
  if (!existsSync(shotsDir)) throw new Error("screenshots/ not found in " + repoRoot);
  const outApp = join(outDir, "app");
  const outShots = join(outDir, "screenshots");
  mkdirSync(outDir, { recursive: true });
  rmSync(outApp, { recursive: true, force: true });
  rmSync(outShots, { recursive: true, force: true });
  cpSync(appDir, outApp, { recursive: true });
  cpSync(shotsDir, outShots, { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
  });
  const dossierPath = join(outDir, "dossier.json");
  writeFileSync(dossierPath, dossier);
  console.log("wrote " + dossierPath + " (" + dossier.length + " bytes)");
}

main();

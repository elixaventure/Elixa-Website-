/**
 * Validates every golden-tests/<property>/expected-property.json against the
 * property engine's validator. Run with: npm run golden
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = join(process.cwd(), "golden-tests");
const dirs = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory());
let failed = 0;

for (const d of dirs) {
  const file = join(root, d.name, "expected-property.json");
  if (!existsSync(file)) continue;
  // run the TS validator through tsx so this stays in lock-step with lib/property
  const src = `
    import { validateProperty } from "${join(process.cwd(), "lib/property/validate.ts").replaceAll("\\", "/")}";
    const model = ${readFileSync(file, "utf8")};
    const errs = validateProperty(model);
    if (errs.length) { console.error(errs.join("\\n")); process.exit(1); }
    console.log("floors:", model.floors.length,
      "walls:", model.floors.reduce((n, f) => n + f.walls.length, 0),
      "openings:", model.floors.reduce((n, f) => n + f.openings.length, 0));
  `;
  try {
    const out = execFileSync("npx", ["tsx", "--eval", src], { encoding: "utf8" });
    console.log(`✓ ${d.name}  ${out.trim()}`);
  } catch (e) {
    failed++;
    console.error(`✗ ${d.name}\n${e.stdout || ""}${e.stderr || ""}`);
  }
}
if (failed) process.exit(1);
console.log("golden tests: all valid");

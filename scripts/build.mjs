import { readdir, readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { join, extname } from "node:path";
const dist = "dist";
await mkdir(join(dist, "server"), { recursive: true });
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
};
const assets = {};
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await collect(path);
    else
      assets["/" + path.slice("public/".length)] = [
        mime[extname(path)],
        (await readFile(path)).toString("base64"),
      ];
  }
}
await collect("public");
const api = await readFile("server/requests.js", "utf8");
const worker = (await readFile("server/worker.js", "utf8")).replace(
  /^import .*;\n/gm,
  "",
);
await writeFile(
  join(dist, "server", "index.js"),
  api + "\nconst assets=" + JSON.stringify(assets) + ";\n" + worker,
);
await cp(".openai", join(dist, ".openai"), { recursive: true });
await cp("drizzle", join(dist, "drizzle"), { recursive: true });

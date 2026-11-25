import http from "node:http";
import { Readable } from "node:stream";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { receiveRequest } from "../server/requests.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = resolve(root, "public");
const dataDir = process.env.DATA_DIR || resolve(root, ".data");
await mkdir(dataDir, { recursive: true });
const sqlite = new DatabaseSync(resolve(dataDir, "studio.sqlite"));
sqlite.exec("PRAGMA journal_mode=WAL");
sqlite.exec("BEGIN IMMEDIATE");
try {
  if (
    !sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='requests'",
      )
      .get()
  ) {
    sqlite.exec(
      await readFile(resolve(root, "drizzle/0000_requests.sql"), "utf8"),
    );
  }
  sqlite.exec("COMMIT");
} catch (error) {
  sqlite.exec("ROLLBACK");
  throw error;
}
const db = {
  prepare: (sql) => ({
    bind: (...args) => ({ run: () => sqlite.prepare(sql).run(...args) }),
  }),
};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://" + req.headers.host);
    if (url.pathname === "/api/requests") {
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        ...(req.method === "POST"
          ? { body: Readable.toWeb(req), duplex: "half" }
          : {}),
      });
      const response = await receiveRequest(request, db);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
      return;
    }
    const path = resolve(
      publicDir,
      "." +
        (url.pathname === "/"
          ? "/index.html"
          : decodeURIComponent(url.pathname)),
    );
    if (
      !path.startsWith(publicDir + sep) ||
      !["GET", "HEAD"].includes(req.method)
    ) {
      res.writeHead(404).end();
      return;
    }
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": mime[extname(path)] || "application/octet-stream",
    });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404).end();
  }
});
const portIndex = process.argv.indexOf("--port");
const port = Number(
  process.env.PORT || (portIndex > 0 ? process.argv[portIndex + 1] : 5173),
);
server.listen(port, "0.0.0.0", () =>
  console.log("Stepbyweb is listening on port " + port),
);

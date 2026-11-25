import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { receiveRequest } from "./requests.js";

const data = {
  id: crypto.randomUUID(),
  name: "Проверка",
  contact: "@example",
  task: "Демонстрационная заявка",
  website: "example.ru",
};
function request(payload) {
  return new Request("https://stepbyweb.test/api/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
test("записывает заявку с нормализованной ссылкой один раз при повторе", async () => {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(
    readFileSync(
      new URL("../drizzle/0000_requests.sql", import.meta.url),
      "utf8",
    ),
  );
  const db = {
    prepare: (sql) => ({
      bind: (...values) => ({ run: () => sqlite.prepare(sql).run(...values) }),
    }),
  };
  for (let i = 0; i < 2; i++)
    assert.equal((await receiveRequest(request(data), db)).status, 201);
  const rows = sqlite.prepare("SELECT website, name FROM requests").all();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].website, "https://example.ru/");
  assert.equal(rows[0].name, data.name);
  sqlite.close();
});
test("отклоняет пустые поля и некорректные адреса", async () => {
  for (const overrides of [
    { name: "  " },
    { contact: "" },
    { task: "" },
    { website: "javascript:void(0)" },
    { website: "слово" },
    { task: "a".repeat(4001) },
  ]) {
    assert.equal(
      (await receiveRequest(request({ ...data, ...overrides }), {})).status,
      422,
    );
  }
});
test("сообщает об ошибке при недоступном хранилище", async () => {
  assert.equal((await receiveRequest(request(data), {})).status, 503);
});

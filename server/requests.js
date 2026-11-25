const limits = { name: 100, contact: 200, task: 4000, website: 500 };
const insert =
  "INSERT INTO requests (id,name,contact,task,website) VALUES (?,?,?,?,?) ON CONFLICT(id) DO NOTHING";

function reply(status, data) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function receiveRequest(request, db) {
  if (request.method !== "POST")
    return reply(405, { error: "Используйте форму заявки." });
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin)
    return reply(403, { error: "Отправьте заявку с сайта студии." });
  let payload;
  try {
    if (!request.headers.get("Content-Type")?.startsWith("application/json"))
      return reply(415, { error: "Для отправки формы включите JavaScript." });
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let raw = "",
      size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 32768) {
        await reader.cancel();
        return reply(413, { error: "Сократите описание задачи." });
      }
      raw += decoder.decode(value, { stream: true });
    }
    payload = JSON.parse(raw + decoder.decode());
  } catch {
    return reply(400, { error: "Проверьте данные формы." });
  }

  if (!payload || typeof payload !== "object")
    return reply(400, { error: "Проверьте данные формы." });
  const fields = {};
  for (const [key, max] of Object.entries(limits)) {
    const value = payload[key] ?? "";
    if (
      typeof value !== "string" ||
      value.length > max ||
      (key !== "website" && !value.trim())
    ) {
      return reply(422, {
        error: "Укажите имя, контакт и описание задачи в пределах длины полей.",
      });
    }
    fields[key] = value.trim();
  }
  if (fields.website) {
    try {
      const url = new URL(
        /^[a-z][a-z0-9+.-]*:/i.test(fields.website)
          ? fields.website
          : "https://" + fields.website,
      );
      if (
        !["http:", "https:"].includes(url.protocol) ||
        !url.hostname.includes(".") ||
        url.username ||
        url.password
      )
        throw new Error();
      fields.website = url.href;
    } catch {
      return reply(422, {
        error: "Проверьте ссылку на сайт, например example.ru.",
      });
    }
  }
  const id = payload.id;
  if (
    typeof id !== "string" ||
    !/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)
  )
    return reply(400, { error: "Обновите страницу и повторите отправку." });
  try {
    await db
      .prepare(insert)
      .bind(id, fields.name, fields.contact, fields.task, fields.website)
      .run();
    return reply(201, { ok: true });
  } catch {
    return reply(503, {
      error: "Не удалось сохранить заявку. Попробуйте ещё раз чуть позже.",
    });
  }
}

import { receiveRequest } from "./requests.js";
import { assets } from "./assets.js";

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === "/api/requests") return receiveRequest(request, env.DB);
    const asset = assets[path === "/" ? "/index.html" : path];
    if (
      !asset ||
      !Array.isArray(asset) ||
      !["GET", "HEAD"].includes(request.method)
    )
      return new Response("Страница не найдена", { status: 404 });
    const [type, data] = asset;
    const body =
      request.method === "HEAD"
        ? null
        : Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    return new Response(body, {
      headers: {
        "Content-Type": type,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": path.startsWith("/assets/")
          ? "public, max-age=3600"
          : "no-cache",
      },
    });
  },
};

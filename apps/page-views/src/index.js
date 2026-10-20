const SITE_ROOT = "/drachenhalle";
const VIEWS_ROUTE = "/api/views";

const json = (value, init = {}) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(value), { ...init, headers });
};

export const normalizePath = (value) => {
  if (typeof value !== "string" || value.length > 300) return null;

  let pathname;
  try {
    pathname = new URL(value, "https://example.invalid").pathname;
  } catch {
    return null;
  }

  if (pathname === `${SITE_ROOT}/index.html`) pathname = `${SITE_ROOT}/`;
  if (pathname !== SITE_ROOT && !pathname.startsWith(`${SITE_ROOT}/`)) return null;
  if (/[\u0000-\u001f\u007f]/u.test(pathname)) return null;

  if (pathname === SITE_ROOT) return `${SITE_ROOT}/`;
  if (!pathname.endsWith("/") && !pathname.split("/").at(-1)?.includes(".")) {
    pathname += "/";
  }

  return pathname;
};

export const isAllowedOrigin = (origin, configuredOrigins = "") => {
  if (!origin) return false;
  const allowed = configuredOrigins
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin);
};

const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  Vary: "Origin",
});

const ensureSchema = (db) => db.prepare(`
  CREATE TABLE IF NOT EXISTS page_views (
    path TEXT PRIMARY KEY,
    views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const readViews = async (db, path) => {
  const [pageResult, totalResult] = await db.batch([
    db.prepare("SELECT views FROM page_views WHERE path = ?").bind(path),
    db.prepare("SELECT COALESCE(SUM(views), 0) AS total_views FROM page_views"),
  ]);

  return {
    views: Number(pageResult.results[0]?.views ?? 0),
    totalViews: Number(totalResult.results[0]?.total_views ?? 0),
  };
};

const incrementViews = async (db, path) => {
  const page = await db.prepare(`
    INSERT INTO page_views (path, views, updated_at)
    VALUES (?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(path) DO UPDATE SET
      views = page_views.views + 1,
      updated_at = CURRENT_TIMESTAMP
    RETURNING views
  `).bind(path).first();
  const total = await db.prepare(
    "SELECT COALESCE(SUM(views), 0) AS total_views FROM page_views",
  ).first();

  return {
    views: Number(page?.views ?? 0),
    totalViews: Number(total?.total_views ?? 0),
  };
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const originAllowed = isAllowedOrigin(origin, env.ALLOWED_ORIGINS);

    if (url.pathname !== VIEWS_ROUTE) {
      return json({ error: "Not found" }, { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return originAllowed
        ? new Response(null, { status: 204, headers: corsHeaders(origin) })
        : json({ error: "Origin not allowed" }, { status: 403 });
    }

    if (!originAllowed) {
      return json({ error: "Origin not allowed" }, { status: 403 });
    }

    let path;
    if (request.method === "GET") {
      path = normalizePath(url.searchParams.get("path"));
    } else if (request.method === "POST") {
      try {
        const body = await request.json();
        path = normalizePath(body?.path);
      } catch {
        return json({ error: "Invalid JSON body" }, {
          status: 400,
          headers: corsHeaders(origin),
        });
      }
    } else {
      return json({ error: "Method not allowed" }, {
        status: 405,
        headers: { ...corsHeaders(origin), Allow: "GET, POST, OPTIONS" },
      });
    }

    if (!path) {
      return json({ error: "Invalid page path" }, {
        status: 400,
        headers: corsHeaders(origin),
      });
    }

    try {
      await ensureSchema(env.DB);
      const counts = request.method === "POST"
        ? await incrementViews(env.DB, path)
        : await readViews(env.DB, path);
      return json({ path, ...counts }, { headers: corsHeaders(origin) });
    } catch (error) {
      console.error("Could not update page views", error);
      return json({ error: "Counter unavailable" }, {
        status: 503,
        headers: corsHeaders(origin),
      });
    }
  },
};

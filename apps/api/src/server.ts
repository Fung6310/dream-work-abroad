import "dotenv/config";
// Must load before any router is created (patches Express's shared Router
// prototype) — without this, a rejected promise in an async route handler
// (e.g. a Postgres query failing) is NOT passed to Express's error handling
// in Express 4. It just hangs the request or crashes the process. See
// docs/ARCHITECTURE.md §12 (security-and-hardening skill review).
import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import adminRoutes from "./routes/admin";
import goRoutes from "./routes/go";
import leadsRoutes from "./routes/leads";
import scholarshipRoutes from "./routes/scholarships";
import { initStore } from "./store";

const app = express();
const PORT = Number(process.env.PORT) || 4100;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3100";
// The back office is a separate app/origin on purpose (docs/ARCHITECTURE.md §9)
// — it needs its own CORS entry, distinct from the public site's.
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "http://localhost:3101";

// helmet's default Cross-Origin-Resource-Policy: "same-origin" blocks a
// cross-origin page from reading the response even when CORS allows it —
// apps/web and apps/admin are deliberately separate origins from this API
// (docs/ARCHITECTURE.md §9), so that default would break every request from
// either frontend. CORS below is what actually restricts who can call this
// API; CORP only needs to get out of its way.
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: [WEB_ORIGIN, ADMIN_ORIGIN], credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// General API rate limit — defense against scripted abuse of the public
// endpoints (search, apply-click, premium waitlist).
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Tighter limit specifically on the admin login endpoint — the shared
// ADMIN_PASSWORD (docs/ARCHITECTURE.md §9) is brute-forceable without this.
app.use(
  "/api/admin/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Try again later." },
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "dreamworkabroad-api" }));

app.use("/api", scholarshipRoutes);
app.use("/api", goRoutes);
app.use("/api", leadsRoutes);
app.use("/api", adminRoutes);

// Catch-all error handler — must be last. Without this, an uncaught error
// (now reachable from async routes via express-async-errors above) falls
// through to Express's default handler, which can leak stack traces.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled API error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

async function main() {
  await initStore();
  app.listen(PORT, () => {
    console.log(`DreamWorkAbroad API listening on http://localhost:${PORT}`);
    console.log(`Store backend: ${process.env.DATABASE_URL ? "Postgres" : "local JSON files"}`);
    console.log(
      `Admin password: ${process.env.ADMIN_PASSWORD || "admin123"} (set ADMIN_PASSWORD to change)`
    );
  });
}

main().catch((err) => {
  console.error("Failed to start API server:", err);
  process.exit(1);
});

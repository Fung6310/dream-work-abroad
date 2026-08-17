import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
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

app.use(cors({ origin: [WEB_ORIGIN, ADMIN_ORIGIN], credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "dreamworkabroad-api" }));

app.use("/api", scholarshipRoutes);
app.use("/api", goRoutes);
app.use("/api", leadsRoutes);
app.use("/api", adminRoutes);

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

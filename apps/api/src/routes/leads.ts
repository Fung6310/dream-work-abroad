import crypto from "crypto";
import { Router } from "express";
import { EDUCATION_LEVELS, EducationLevel } from "@dreamworkabroad/shared";
import { addLead } from "../store";

const router = Router();

function isEducationLevel(value: unknown): value is EducationLevel {
  return typeof value === "string" && value in EDUCATION_LEVELS;
}

// POST /api/premium/leads — the entire "premium" build for now: capture
// interest so the waitlist is real and visible in admin, no billing wired up
// yet (see docs/MONETIZATION.md for the Stripe roadmap).
router.post("/premium/leads", async (req, res) => {
  const { email, name, interestLevel } = req.body ?? {};
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required" });
  }

  await addLead({
    id: crypto.randomUUID(),
    email,
    name: typeof name === "string" && name ? name : undefined,
    interestLevel: isEducationLevel(interestLevel) ? interestLevel : undefined,
    timestamp: new Date().toISOString(),
  });

  res.json({ ok: true });
});

export default router;

import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { addLead } from "../store";

const router = Router();

const LeadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(200).optional(),
  interestLevel: z.enum(["diploma", "undergraduate", "postgraduate", "phd", "professional"]).optional(),
});

// POST /api/premium/leads — the entire "premium" build for now: capture
// interest so the waitlist is real and visible in admin, no billing wired up
// yet (see docs/MONETIZATION.md for the Stripe roadmap).
router.post("/premium/leads", async (req, res) => {
  const parsed = LeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "A valid email is required", details: parsed.error.flatten() });
  }
  const { email, name, interestLevel } = parsed.data;

  await addLead({
    id: crypto.randomUUID(),
    email,
    name,
    interestLevel,
    timestamp: new Date().toISOString(),
  });

  res.json({ ok: true });
});

export default router;

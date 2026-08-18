import crypto from "crypto";
import { Router } from "express";
import { z } from "zod";
import { addLead } from "../store";

const router = Router();

const LeadSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().min(1).max(200).optional(),
  interestLevel: z.enum(["diploma", "undergraduate", "postgraduate", "phd", "professional"]).optional(),
  // Set when captured from a scholarship's own "remind me" CTA, or (id/title
  // omitted) a general partner/provider inquiry via /partners with a message.
  scholarshipId: z.string().trim().min(1).max(200).optional(),
  scholarshipTitle: z.string().trim().min(1).max(200).optional(),
  message: z.string().trim().max(2000).optional(),
});

// POST /api/premium/leads — the entire "premium" build for now: capture
// interest so the waitlist is real and visible in admin, no billing wired up
// yet (see docs/MONETIZATION.md for the Stripe roadmap). Also doubles as the
// capture point for /partners provider inquiries (message set, scholarship
// fields omitted) — same table, same admin visibility, no new plumbing.
router.post("/premium/leads", async (req, res) => {
  const parsed = LeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ error: "A valid email is required", details: parsed.error.flatten() });
  }
  const { email, name, interestLevel, scholarshipId, scholarshipTitle, message } = parsed.data;

  await addLead({
    id: crypto.randomUUID(),
    email,
    name,
    interestLevel,
    scholarshipId,
    scholarshipTitle,
    message,
    timestamp: new Date().toISOString(),
  });

  res.json({ ok: true });
});

export default router;

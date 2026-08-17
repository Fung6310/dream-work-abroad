import crypto from "crypto";
import { Router } from "express";
import { addClick, getScholarshipById } from "../store";

const router = Router();

// GET /api/go/:scholarshipId?sid=<sessionId>
// The ONLY link "Apply Now" ever points at. Logs an ApplyClickEvent then
// redirects to the scholarship's official application page — this is how the
// admin dashboard gets "most applied-to" stats without any client-side JS,
// and it also proves engagement numbers to a university/agent considering a
// featured-listing placement (see docs/MONETIZATION.md).
//
// Never redirects for anything that isn't published, so pending/rejected
// items can't be reached by guessing an id.
router.get("/go/:scholarshipId", async (req, res) => {
  const scholarship = await getScholarshipById(req.params.scholarshipId);
  if (!scholarship || scholarship.status !== "published") {
    return res.status(404).send("Scholarship not found");
  }

  const sessionId =
    typeof req.query.sid === "string" && req.query.sid ? req.query.sid : crypto.randomUUID();

  await addClick({
    id: crypto.randomUUID(),
    scholarshipId: scholarship.id,
    scholarshipTitle: scholarship.title,
    providerType: scholarship.providerType,
    destinationCountry: scholarship.destinationCountry,
    timestamp: new Date().toISOString(),
    sessionId,
  });

  res.redirect(302, scholarship.officialApplicationUrl);
});

export default router;

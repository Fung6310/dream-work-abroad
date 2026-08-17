import fs from "fs";
import path from "path";
import { ApplyClickEvent, PremiumLead, Scholarship } from "@dreamworkabroad/shared";
import { SEED_SCHOLARSHIPS } from "../data/seed";
import { Store } from "./types";

// Local-dev fallback: JSON files, debounced writes — used automatically
// whenever DATABASE_URL isn't set (see store/index.ts). Production should set
// DATABASE_URL so pgStore.ts is used instead — see docs/ARCHITECTURE.md §3.

const DATA_DIR = path.join(__dirname, "..", "..");
const SCHOLARSHIPS_FILE = path.join(DATA_DIR, "data.scholarships.json");
const EVENTS_FILE = path.join(DATA_DIR, "data.events.json");
const LEADS_FILE = path.join(DATA_DIR, "data.leads.json");

let scholarships: Scholarship[] = [];
let clicks: ApplyClickEvent[] = [];
let leads: PremiumLead[] = [];

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function debounced(file: string, getData: () => unknown) {
  let timer: NodeJS.Timeout | null = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fs.writeFileSync(file, JSON.stringify(getData(), null, 2));
    }, 200);
  };
}

const persistScholarships = debounced(SCHOLARSHIPS_FILE, () => scholarships);
const persistEvents = debounced(EVENTS_FILE, () => ({ clicks }));
const persistLeads = debounced(LEADS_FILE, () => ({ leads }));

async function init(): Promise<void> {
  const loaded = readJson<Scholarship[]>(SCHOLARSHIPS_FILE, []);
  scholarships = loaded.length > 0 ? loaded : SEED_SCHOLARSHIPS;
  clicks = readJson<{ clicks: ApplyClickEvent[] }>(EVENTS_FILE, { clicks: [] }).clicks;
  leads = readJson<{ leads: PremiumLead[] }>(LEADS_FILE, { leads: [] }).leads;
}

async function getAllScholarships(): Promise<Scholarship[]> {
  return scholarships;
}

async function getScholarshipById(id: string): Promise<Scholarship | undefined> {
  return scholarships.find((s) => s.id === id);
}

async function addScholarship(s: Scholarship): Promise<void> {
  scholarships.push(s);
  persistScholarships();
}

async function updateScholarship(
  id: string,
  patch: Partial<Scholarship>
): Promise<Scholarship | undefined> {
  const idx = scholarships.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  scholarships[idx] = { ...scholarships[idx], ...patch, updatedAt: new Date().toISOString() };
  persistScholarships();
  return scholarships[idx];
}

async function deleteScholarship(id: string): Promise<boolean> {
  const before = scholarships.length;
  scholarships = scholarships.filter((s) => s.id !== id);
  if (scholarships.length !== before) {
    persistScholarships();
    return true;
  }
  return false;
}

async function addClick(click: ApplyClickEvent): Promise<void> {
  clicks.push(click);
  persistEvents();
}

async function getClicks(): Promise<ApplyClickEvent[]> {
  return clicks;
}

async function addLead(lead: PremiumLead): Promise<void> {
  leads.push(lead);
  persistLeads();
}

async function getLeads(): Promise<PremiumLead[]> {
  return leads;
}

export const fileStore: Store = {
  init,
  getAllScholarships,
  getScholarshipById,
  addScholarship,
  updateScholarship,
  deleteScholarship,
  addClick,
  getClicks,
  addLead,
  getLeads,
};

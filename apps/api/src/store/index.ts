import { fileStore } from "./fileStore";
import { pgStore } from "./pgStore";
import { Store } from "./types";

// DATABASE_URL set (Render/production) -> Postgres. Not set (local dev) ->
// JSON files on disk. Every route imports from "../store" and never knows or
// cares which backend is live — see docs/ARCHITECTURE.md §3.
const store: Store = process.env.DATABASE_URL ? pgStore : fileStore;

export async function initStore(): Promise<void> {
  await store.init();
}

export const getAllScholarships = store.getAllScholarships;
export const getScholarshipById = store.getScholarshipById;
export const addScholarship = store.addScholarship;
export const updateScholarship = store.updateScholarship;
export const deleteScholarship = store.deleteScholarship;
export const addClick = store.addClick;
export const getClicks = store.getClicks;
export const addLead = store.addLead;
export const getLeads = store.getLeads;

"use client";

import { useEffect, useState } from "react";
import { adminLogin, adminLogout, adminSession } from "@/lib/api";
import AdminNav from "./AdminNav";

type Status = "loading" | "signedOut" | "signedIn";

// Wraps every admin page. Checks the session cookie on mount, shows a
// password form if unauthenticated, otherwise renders the shared nav + the
// page's own content. Same demo-grade password gate as the API's
// requireAdmin middleware — see docs/ARCHITECTURE.md §9.
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    adminSession().then((s) => setStatus(s.authenticated ? "signedIn" : "signedOut"));
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const ok = await adminLogin(password);
    if (!ok) {
      setLoginError("Incorrect password.");
      return;
    }
    setStatus("signedIn");
    setPassword("");
  }

  async function onLogout() {
    await adminLogout();
    setStatus("signedOut");
  }

  if (status === "loading") {
    return <p className="text-textMuted dark:text-textMuted2">Loading…</p>;
  }

  if (status === "signedOut") {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-4 rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-6">
        <div>
          <h1 className="text-lg font-semibold text-text dark:text-text2">Back office sign-in</h1>
          <p className="mt-1 text-xs text-textMuted dark:text-textMuted2">
            Demo password gate. Default is <code>admin123</code> unless <code>ADMIN_PASSWORD</code> is set on the
            API.
          </p>
        </div>
        <form onSubmit={onLogin} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-xl2 border border-border dark:border-border2 bg-bg dark:bg-bg2 px-3 py-2 text-text dark:text-text2 outline-none focus:ring-2 focus:ring-primary"
          />
          {loginError && <p className="text-sm text-danger dark:text-danger2">{loginError}</p>}
          <button
            type="submit"
            className="rounded-xl2 bg-primary px-4 py-2 font-medium text-white hover:bg-primaryDark dark:bg-primary2 dark:text-bg2"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminNav onLogout={onLogout} />
      {children}
    </div>
  );
}

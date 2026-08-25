import type { Metadata } from "next";
import PartnerInquiryForm from "@/components/PartnerInquiryForm";

export const metadata: Metadata = {
  title: "For Scholarship Providers — DreamWorkAbroad",
  description: "Get your scholarship featured at the top of relevant searches on DreamWorkAbroad.",
};

const BENEFITS = [
  { title: "Top placement", body: "Your listing appears first in relevant searches, with a distinct Featured badge." },
  { title: "Real engagement data", body: "Every Apply click is tracked — we can show you how many students clicked through." },
  { title: "Simple to start", body: "No ad platform to set up — a short conversation and an invoice, that's it." },
];

export default function PartnersPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold text-text dark:text-text2">For scholarship providers</h1>
        <p className="max-w-xl text-textMuted dark:text-textMuted2">
          DreamWorkAbroad is a Malaysia-focused scholarship directory built to help students find and compare
          funding options in one place. We offer a limited number of featured placements — your listing appears at
          the top of relevant searches with a highlighted badge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BENEFITS.map((b) => (
          <div
            key={b.title}
            className="rounded-xl2 border border-border dark:border-border2 bg-surface dark:bg-surface2 p-4"
          >
            <p className="font-semibold text-text dark:text-text2">{b.title}</p>
            <p className="mt-1 text-sm text-textMuted dark:text-textMuted2">{b.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl2 border-2 border-primary/40 bg-primaryLight/10 dark:border-primary2/40 dark:bg-primaryLight2/10 p-5 text-center">
        <p className="text-sm font-medium text-textMuted dark:text-textMuted2">Featured placement, from</p>
        <p className="mt-1 text-3xl font-bold text-text dark:text-text2">RM 200/month</p>
        <p className="mt-1 text-sm text-textMuted dark:text-textMuted2">
          Cheaper on a quarterly commitment. Exact rate depends on how many relevant searches your programme
          matches — tell us below and we&apos;ll confirm a number within a day.
        </p>
      </div>

      <PartnerInquiryForm />
    </div>
  );
}

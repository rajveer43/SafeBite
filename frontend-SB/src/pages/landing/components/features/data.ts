import {
  MessageSquareWarning, FileCheck, Search, Bell,
  type LucideIcon,
} from "lucide-react";

export type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  /* Short capability bullets — give each card its own substance. */
  bullets: string[];
  /* A single micro-metric that lifts perceived quality. */
  metric: { label: string; value: string };
};

/* The four secondary features shown in the bento grid.
   AI Safety Scores is handled separately by FeaturedAIScoreCard,
   and Verified Restaurants by VerifiedBanner. */
export const featureItems: FeatureItem[] = [
  {
    icon: MessageSquareWarning,
    title: "Complaint Management",
    description: "Handle customer complaints from submission to resolution with automated workflows.",
    href: "#features",
    bullets: ["Complaint tracking", "Assign inspectors", "Resolution workflow"],
    metric: { label: "Handled", value: "1,200+ / mo" },
  },
  {
    icon: FileCheck,
    title: "Certificate Tracking",
    description: "Track licenses and certifications before they expire.",
    href: "#features",
    bullets: ["Expiration reminders", "Compliance status", "Digital records"],
    metric: { label: "Avg. renewals", value: "98%" },
  },
  {
    icon: Search,
    title: "Real-Time Inspections",
    description: "Monitor inspections with instant reporting and compliance updates.",
    href: "#features",
    bullets: ["Live updates", "Inspector timeline", "GPS verification"],
    metric: { label: "Updated", value: "every 30s" },
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Receive alerts when scores change or action is required.",
    href: "#features",
    bullets: ["Email alerts", "SMS reminders", "Push notifications"],
    metric: { label: "Response time", value: "< 1 min" },
  },
];

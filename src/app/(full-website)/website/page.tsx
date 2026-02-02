import WebsiteBuilder from "@/components/website/WebsiteBuilder";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Website Builder | TailAdmin - Next.js Dashboard Template",
  description:
    "Build websites from a prompt and edit content manually — TailAdmin Dashboard",
};

export default function WebsitePage() {
  return (
    <div className="h-full overflow-auto">
      <WebsiteBuilder fullPage />
    </div>
  );
}

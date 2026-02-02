"use client";

import React from "react";

export default function FullWebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col overflow-hidden bg-gray-900">
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

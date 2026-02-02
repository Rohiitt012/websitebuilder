"use client";

import React, { useState, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { PaperPlaneIcon, TrashBinIcon } from "@/icons";

type WebsiteSection = {
  id: string;
  title: string;
  content: string;
};

type WebsiteContent = {
  title: string;
  heroHeading: string;
  heroDescription: string;
  sections: WebsiteSection[];
};

const createSection = (title: string, content: string, id?: string): WebsiteSection => ({
  id: id || `section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  title,
  content,
});

function buildFromPrompt(prompt: string): WebsiteContent {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return {
      title: "My Website",
      heroHeading: "Welcome",
      heroDescription: "Describe your website here.",
      sections: [
        createSection("About", "Add your content here.", "section-1"),
        createSection("Services", "Add your services or features here.", "section-2"),
      ],
    };
  }
  const lines = trimmed.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "My Website";
  const secondLine = lines[1] || "Welcome";
  const rest = lines.slice(2).join(" ") || "Describe your website here.";
  const sections: WebsiteSection[] = [];
  if (lines.length > 3) {
    for (let i = 2; i < lines.length; i += 2) {
      const title = lines[i] || `Section ${sections.length + 1}`;
      const content = lines[i + 1] || "";
      sections.push(createSection(title, content));
    }
  }
  if (sections.length === 0) {
    sections.push(createSection("About", rest || "Add your content here."));
    sections.push(createSection("More", "You can edit all sections manually."));
  }
  return {
    title: firstLine.length > 50 ? firstLine.slice(0, 50) : firstLine,
    heroHeading: secondLine.length > 60 ? secondLine.slice(0, 60) : secondLine,
    heroDescription: rest.length > 300 ? rest.slice(0, 300) : rest,
    sections,
  };
}

export default function WebsiteBuilder() {
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [showPromptBar, setShowPromptBar] = useState(true);

  const handleBuild = useCallback(() => {
    const built = buildFromPrompt(prompt);
    setContent(built);
    setShowPromptBar(false);
  }, [prompt]);

  const handleBuildNew = useCallback(() => {
    setContent(null);
    setPrompt("");
    setShowPromptBar(true);
  }, []);

  const updateContent = useCallback(<K extends keyof WebsiteContent>(field: K, value: WebsiteContent[K]) => {
    setContent((prev) => (prev ? { ...prev, [field]: value } : null));
  }, []);

  const updateSection = useCallback((id: string, updates: Partial<WebsiteSection>) => {
    setContent((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
    });
  }, []);

  const addSection = useCallback(() => {
    setContent((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: [...prev.sections, createSection("New Section", "Add content here.")],
      };
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setContent((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        sections: prev.sections.filter((s) => s.id !== id),
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Website" />

      {/* Prompt bar - shown when no content or user wants to build new */}
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${
          showPromptBar ? "block" : "hidden"
        }`}
      >
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h3 className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            Build your website — enter a prompt
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Describe your site below and click Build Website. You can then edit all content manually in the editor.
          </p>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBuild()}
            placeholder="e.g. Portfolio — Jane Lo, Product Designer, San Francisco"
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleBuild}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <PaperPlaneIcon className="h-5 w-5" />
            Build Website
          </button>
        </div>
      </div>

      {/* Built website – editable */}
      {content && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-theme-sm text-gray-600 dark:text-gray-400">
              Edit section titles and content below. Changes apply in real time.
            </p>
            <button
              type="button"
              onClick={handleBuildNew}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Build new website
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            {/* Editable header / title */}
            <div className="border-b border-gray-200 px-4 py-6 dark:border-gray-800 md:px-6">
              <input
                value={content.title}
                onChange={(e) => updateContent("title", e.target.value)}
                className="w-full bg-transparent text-2xl font-semibold text-gray-800 outline-none placeholder-gray-400 dark:text-white md:text-3xl"
                placeholder="Website title"
              />
            </div>

            {/* Hero – editable */}
            <div className="space-y-4 px-4 py-8 md:px-6">
              <input
                value={content.heroHeading}
                onChange={(e) => updateContent("heroHeading", e.target.value)}
                className="w-full bg-transparent text-xl font-semibold text-gray-800 outline-none placeholder-gray-400 dark:text-white md:text-2xl"
                placeholder="Hero heading"
              />
              <textarea
                value={content.heroDescription}
                onChange={(e) => updateContent("heroDescription", e.target.value)}
                rows={3}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
                placeholder="Hero description"
              />
            </div>

            {/* Editable sections */}
            <div className="space-y-6 px-4 pb-8 md:px-6">
              {content.sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="flex-1 bg-transparent text-lg font-medium text-gray-800 outline-none dark:text-white"
                      placeholder="Section title"
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
                      title="Remove section"
                    >
                      <TrashBinIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    rows={3}
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-600 placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:placeholder-gray-500"
                    placeholder="Section content"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addSection}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-4 text-sm font-medium text-gray-500 transition hover:border-brand-500 hover:text-brand-500 dark:border-gray-700 dark:hover:border-brand-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* When no content and prompt bar hidden (shouldn't happen) */}
      {!content && !showPromptBar && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setShowPromptBar(true)}
            className="text-brand-500 hover:underline"
          >
            Show prompt bar
          </button>
        </div>
      )}
    </div>
  );
}

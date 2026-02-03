"use client";

import React, { useState, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { PaperPlaneIcon } from "@/icons";
import WebsiteEditorView from "@/components/website/WebsiteEditorView";

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

type WebsiteBuilderProps = { fullPage?: boolean };

export default function WebsiteBuilder({ fullPage = false }: WebsiteBuilderProps) {
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [showPromptBar, setShowPromptBar] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    <div className={fullPage ? "flex h-full flex-col overflow-hidden" : "space-y-6"}>
      {!fullPage && <PageBreadcrumb pageTitle="Website" />}

      {/* Prompt bar - shown when no content or user wants to build new */}
      <div
        className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${
          showPromptBar ? "block" : "hidden"
        } ${fullPage ? "mx-4 mt-4 shrink-0" : ""}`}
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

      {/* Full editor interface after Build Website */}
      {content && (
        <div className={fullPage ? "min-h-0 flex-1 overflow-hidden" : ""}>
          <WebsiteEditorView
            content={content}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdateContent={updateContent}
            onUpdateSection={updateSection}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onBuildNew={handleBuildNew}
            fullPage={fullPage}
          />
        </div>
      )}

      {/* When no content and prompt bar hidden (shouldn't happen) */}
      {!content && !showPromptBar && (
        <div className={`rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03] ${fullPage ? "mx-4 mt-4" : ""}`}>
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

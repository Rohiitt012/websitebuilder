"use client";

import Link from "next/link";
import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  FileIcon,
  ListIcon,
  BoxCubeIcon,
  TrashBinIcon,
  PencilIcon,
  BoltIcon,
  FolderIcon,
  GridIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon,
  EyeIcon,
  DocsIcon,
  HorizontaLDots,
  TimeIcon,
  CheckLineIcon,
  PageIcon,
} from "@/icons";

export type WebsiteSection = {
  id: string;
  title: string;
  content: string;
};

export type WebsiteContent = {
  title: string;
  heroHeading: string;
  heroDescription: string;
  sections: WebsiteSection[];
};

type NavNode = {
  id: string;
  label: string;
  children?: NavNode[];
  collapsible?: boolean;
  iconType?: "body" | "cube" | "section" | "sectionCollapsible" | "text" | "h1" | "h2" | "p" | "link" | "grid" | "divBlock";
};

type Props = {
  content: WebsiteContent;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateContent: <K extends keyof WebsiteContent>(field: K, value: WebsiteContent[K]) => void;
  onUpdateSection: (id: string, updates: Partial<WebsiteSection>) => void;
  onAddSection: () => void;
  onRemoveSection: (id: string) => void;
  onBuildNew: () => void;
  fullPage?: boolean;
};

const VIEWPORT_WIDTHS = [1065, 768, 375];
const GET_STARTED_ITEMS = [
  "Create a site",
  "Change colors, fonts, and classes",
  "Replace images",
  "Modify the layout of your template",
  "Connect your site to dynamic data",
  "Customize content with Localization",
  "Get help with video tutorials",
  "Publish your site",
] as const;

function NavigatorTree({
  nodes,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  level = 0,
}: {
  nodes: NavNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  level?: number;
}) {
  const iconWrapperClass = "flex h-6 w-6 min-w-[1.5rem] shrink-0 items-center justify-center overflow-visible p-0.5 mr-0.5 [&>svg]:size-5 [&>svg]:shrink-0";

  return (
    <ul className={level === 0 ? "space-y-0.5" : "ml-3 mt-0.5 space-y-0.5 border-l border-gray-700 pl-2"}>
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpandable = node.id === "body" || !!node.collapsible;
        const isExpanded = expandedIds.has(node.id);
        const isSelected = selectedId === node.id;
        const isCubeNode = node.iconType === "cube";

        return (
          <li key={node.id}>
            <div className="flex min-w-0 items-center gap-2">
              {isExpandable && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
                  className="flex h-6 w-6 min-w-[1.5rem] shrink-0 items-center justify-center rounded p-0 text-gray-400 hover:bg-gray-800 hover:text-white"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <span className="inline-flex h-5 w-5 items-center justify-center text-xl font-medium text-gray-400 leading-none">&gt;</span>
                  )}
                </button>
              )}
              {!isExpandable && level > 0 && <span className="w-6 min-w-[1.5rem] shrink-0" />}
              {(node.iconType === "body" || node.iconType === "sectionCollapsible") && (
                <span className={iconWrapperClass} aria-hidden>
                  <span className="h-4 w-4 min-w-[1rem] rounded-sm border border-gray-500 bg-transparent" />
                </span>
              )}
              {node.iconType === "divBlock" && (
                <span className={`${iconWrapperClass} text-xs font-medium text-gray-400`}>#</span>
              )}
              {node.iconType === "cube" && (
                <span className={`${iconWrapperClass} text-green-500`}>
                  <BoxCubeIcon className="h-5 w-5 shrink-0" />
                </span>
              )}
              {node.iconType === "section" && (
                <span className={`${iconWrapperClass} text-gray-400`}>
                  <PageIcon className="h-5 w-5 shrink-0" />
                </span>
              )}
              {node.iconType === "grid" && (
                <span className={`${iconWrapperClass} text-gray-400`}>
                  <GridIcon className="h-5 w-5 shrink-0" />
                </span>
              )}
              {node.iconType === "text" && (
                <span className={`${iconWrapperClass} text-xs font-semibold text-gray-400`}>T</span>
              )}
              {node.iconType === "h1" && (
                <span className={`${iconWrapperClass} text-[10px] font-bold text-gray-400`}>H1</span>
              )}
              {node.iconType === "h2" && (
                <span className={`${iconWrapperClass} text-[10px] font-bold text-gray-400`}>H2</span>
              )}
              {node.iconType === "p" && (
                <span className={`${iconWrapperClass} text-[10px] font-bold text-gray-400`}>P</span>
              )}
              {node.iconType === "link" && (
                <span className={`${iconWrapperClass} text-gray-400`} aria-hidden>⎗</span>
              )}
              <button
                type="button"
                onClick={() => onSelect(node.id)}
                className={`min-w-0 flex-1 rounded px-2 py-1.5 text-left text-sm transition ${
                  isSelected ? "bg-green-500/20 text-green-400" : isCubeNode ? "text-green-400 hover:bg-gray-800 hover:text-green-300" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="break-words">{node.label}</span>
              </button>
            </div>
            {hasChildren && isExpandable && isExpanded && (
              <NavigatorTree
                nodes={node.children!}
                selectedId={selectedId}
                onSelect={onSelect}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function WebsiteEditorView({
  content,
  selectedId,
  onSelect,
  onUpdateContent,
  onUpdateSection,
  onAddSection,
  onRemoveSection,
  onBuildNew,
  fullPage = false,
}: Props) {
  const [viewportPx, setViewportPx] = useState(1065);
  const [propertiesTab, setPropertiesTab] = useState<"Style" | "Properties" | "Settings" | "Interactions">("Style");
  const [getStartedCompleted, setGetStartedCompleted] = useState<boolean[]>([true, false, false, false, false, false, false, false]);
  const [getStartedExpanded, setGetStartedExpanded] = useState(true);

  const getStartedCount = getStartedCompleted.filter(Boolean).length;
  const toggleGetStarted = (index: number) => {
    setGetStartedCompleted((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const navTree = useMemo((): NavNode[] => {
    return [
      {
        id: "body",
        label: "Body",
        iconType: "body",
        collapsible: true,
        children: [
          { id: "navigation", label: "Navigation", iconType: "cube" },
          {
            id: "hero",
            label: "Section",
            collapsible: true,
            iconType: "sectionCollapsible",
            children: [
              {
                id: "hero-container",
                label: "Container",
                collapsible: true,
                iconType: "sectionCollapsible",
                children: [
                  {
                    id: "intro-wrap",
                    label: "Intro Wrap",
                    collapsible: true,
                    iconType: "sectionCollapsible",
                    children: [
                      { id: "name-text", label: "Name Text", iconType: "text" },
                      { id: "paragraph-intro", label: "Paragraph Light", iconType: "text" },
                      { id: "heading-jumbo", label: "Heading Jumbo", iconType: "h1" },
                    ],
                  },
                ],
              },
              { id: "section-2", label: "Section", iconType: "section" },
              { id: "section-3", label: "Section", iconType: "section" },
            ],
          },
          {
            id: "works-section",
            label: "Section",
            collapsible: true,
            iconType: "sectionCollapsible",
            children: [
              {
                id: "works-grid",
                label: "Works Grid",
                collapsible: true,
                iconType: "grid",
                children: [
                  {
                    id: "div-block-1",
                    label: "Div Block",
                    collapsible: true,
                    iconType: "divBlock",
                    children: [
                      { id: "work-image-1", label: "Work Image", iconType: "link" },
                      {
                        id: "work-desc-1",
                        label: "Work Description",
                        collapsible: true,
                        iconType: "sectionCollapsible",
                        children: [
                          { id: "project-link-1", label: "Project Name Link", iconType: "link" },
                          { id: "paragraph-work-1", label: "Paragraph Light", iconType: "text" },
                        ],
                      },
                    ],
                  },
                  { id: "div-block-2", label: "Div Block", collapsible: true, iconType: "divBlock" },
                  { id: "div-block-3", label: "Div Block", collapsible: true, iconType: "divBlock" },
                  { id: "div-block-4", label: "Div Block", collapsible: true, iconType: "divBlock" },
                ],
              },
              {
                id: "experience-container",
                label: "Container",
                collapsible: true,
                iconType: "sectionCollapsible",
                children: [
                  {
                    id: "career-headline-wrap",
                    label: "Carrer Headline Wrap",
                    collapsible: true,
                    iconType: "sectionCollapsible",
                    children: [
                      { id: "heading-experience", label: "My experience", iconType: "h2" },
                      { id: "paragraph-experience", label: "Paragraph Light", iconType: "p" },
                    ],
                  },
                  {
                    id: "work-experience-grid",
                    label: "Work Experience Grid",
                    collapsible: true,
                    iconType: "grid",
                    children: [
                      {
                        id: "work-position-1",
                        label: "Work Position Wrap",
                        collapsible: true,
                        iconType: "sectionCollapsible",
                        children: [
                          { id: "position-name-1", label: "Position Name Text", iconType: "text" },
                          { id: "position-p-1", label: "Paragraph Light", iconType: "text" },
                          { id: "position-tiny-1", label: "Paragraph Tiny", iconType: "text" },
                        ],
                      },
                      {
                        id: "work-position-2",
                        label: "Work Position Wrap",
                        collapsible: true,
                        iconType: "sectionCollapsible",
                        children: [
                          { id: "position-name-2", label: "Position Name Text", iconType: "text" },
                          { id: "position-p-2", label: "Paragraph Light", iconType: "text" },
                          { id: "position-tiny-2", label: "Paragraph Tiny", iconType: "text" },
                        ],
                      },
                      {
                        id: "work-position-3",
                        label: "Work Position Wrap",
                        collapsible: true,
                        iconType: "sectionCollapsible",
                        children: [
                          { id: "position-name-3", label: "Position Name Text", iconType: "text" },
                          { id: "position-p-3", label: "Paragraph Light", iconType: "text" },
                          { id: "position-tiny-3", label: "Paragraph Tiny", iconType: "text" },
                        ],
                      },
                      {
                        id: "work-position-4",
                        label: "Work Position Wrap",
                        collapsible: true,
                        iconType: "sectionCollapsible",
                        children: [
                          { id: "position-name-4", label: "Position Name Text", iconType: "text" },
                          { id: "position-p-4", label: "Paragraph Light", iconType: "text" },
                          { id: "position-tiny-4", label: "Paragraph Tiny", iconType: "text" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { id: "contact", label: "Contact", iconType: "cube" },
          { id: "footer", label: "Footer", iconType: "cube" },
        ],
      },
    ];
  }, []);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["body", "hero", "works-section"]));
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedLabel = useMemo(() => {
    if (!selectedId) return null;
    const labels: Record<string, string> = {
      body: "Body",
      navigation: "Navigation",
      hero: "Section",
      "hero-container": "Container",
      "intro-wrap": "Intro Wrap",
      "name-text": "Name Text",
      "paragraph-intro": "Paragraph Light",
      "heading-jumbo": "Heading Jumbo",
      "section-2": "Section",
      "section-3": "Section",
      "works-section": "Section",
      "works-grid": "Works Grid",
      "div-block-1": "Div Block",
      "work-image-1": "Work Image",
      "work-desc-1": "Work Description",
      "project-link-1": "Project Name Link",
      "paragraph-work-1": "Paragraph Light",
      "experience-container": "Container",
      "career-headline-wrap": "Carrer Headline Wrap",
      "heading-experience": "My experience",
      "paragraph-experience": "Paragraph Light",
      "work-experience-grid": "Work Experience Grid",
      contact: "Contact",
      footer: "Footer",
    };
    for (let i = 1; i <= 4; i++) {
      labels[`div-block-${i}`] = "Div Block";
      labels[`work-position-${i}`] = "Work Position Wrap";
      labels[`position-name-${i}`] = "Position Name Text";
      labels[`position-p-${i}`] = "Paragraph Light";
      labels[`position-tiny-${i}`] = "Paragraph Tiny";
    }
    return labels[selectedId] ?? selectedId.replace(/-/g, " ");
  }, [selectedId]);

  const leftIcons = [
    { Icon: PlusIcon, title: "Add" },
    { Icon: FileIcon, title: "Pages" },
    { Icon: ListIcon, title: "Layers" },
    { Icon: BoxCubeIcon, title: "Components" },
    { Icon: FolderIcon, title: "Assets" },
    { Icon: PencilIcon, title: "Code" },
    { Icon: BoltIcon, title: "Actions" },
    { Icon: DocsIcon, title: "Docs" },
    { Icon: GridIcon, title: "Dashboard" },
    { Icon: HorizontaLDots, title: "Settings" },
    { Icon: BellIcon, title: "Help" },
    { Icon: TimeIcon, title: "History" },
  ];

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        fullPage ? "h-full rounded-none bg-gray-900" : "h-[calc(100vh-8rem)] min-h-[600px] rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
      }`}
    >
      {/* Top bar */}
      <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-gray-700 bg-gray-800 px-3 py-2">
        <div className="flex items-center gap-2">
          {fullPage && (
            <Link href="/" className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-white">
              <span aria-hidden>←</span> Back
            </Link>
          )}
          {["Design", "CMS", "App Gen", "Insights"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`rounded px-3 py-1.5 text-sm font-medium transition ${
                tab === "Design" ? "bg-brand-500/25 text-brand-300" : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
          <span className="ml-2 h-4 w-px bg-gray-600" />
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Undo">
            <span aria-hidden>↶</span>
          </button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Redo">
            <span aria-hidden>↷</span>
          </button>
          <span className="ml-2 text-xs text-gray-400">Body {selectedLabel ? `> ${selectedLabel}` : ""}</span>
        </div>
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded border border-gray-600 bg-gray-700/80 px-2.5 py-1.5 text-sm text-white hover:bg-gray-700">
            <span aria-hidden>⌂</span> Home <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded border border-gray-600 bg-gray-700/50">
            {VIEWPORT_WIDTHS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setViewportPx(w)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${viewportPx === w ? "bg-brand-500 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
              >
                {w}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{viewportPx}px</span>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Notifications">
            <BellIcon className="h-5 w-5" />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">RC</div>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Preview">
            <EyeIcon className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">
            Share
          </button>
          <button type="button" className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">
            Publish <ChevronDownIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={onBuildNew} className="rounded-lg border border-gray-600 bg-gray-700/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">
            Build new
          </button>
        </div>
      </div>

      {/* CURRENT PAGE bar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-600 bg-gray-700/90 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Current page</span>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white" title="Add page">
            <PlusIcon className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white" title="Settings">
            <span aria-hidden>⚙</span>
          </button>
        </div>
      </div>

      {/* Main: icon strip + Navigator + Canvas + Properties */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex w-12 shrink-0 flex-col border-r border-gray-700 bg-gray-900">
          <div className="flex flex-col items-center gap-0.5 py-2">
            <button type="button" className="rounded p-2 text-white hover:bg-gray-800" title="Add">
              <PlusIcon className="h-5 w-5" />
            </button>
            {leftIcons.slice(1).map(({ Icon, title }) => (
              <button key={title} type="button" title={title} className="rounded p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex w-72 shrink-0 flex-col border-r border-gray-700 bg-gray-900 min-w-0">
          <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onAddSection} className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white" title="Add">
                <PlusIcon className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-white">Navigator</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white" title="Sort">
                <span className="inline-block h-4 w-4 align-middle" aria-hidden>↕</span>
              </button>
              <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white" title="Pin">
                <span className="inline-block h-4 w-4 align-middle" aria-hidden>📌</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-visible p-2">
            <NavigatorTree
              nodes={navTree}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
            />
          </div>
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-auto bg-gray-800/30 p-6">
            <div className="mx-auto min-h-full rounded-lg border border-gray-600 bg-white shadow-xl" style={{ maxWidth: viewportPx }}>
              <div className="p-6 md:p-10">
                {/* Navigation */}
                <nav
                  data-id="navigation"
                  onClick={(e) => { e.stopPropagation(); onSelect("navigation"); }}
                  className={`relative flex items-center justify-between border-b-2 border-brand-500 pb-3 ${selectedId === "navigation" ? "ring-2 ring-brand-500 ring-offset-2 -m-1 p-1 rounded" : ""}`}
                >
                  <h1 className="text-2xl font-bold text-gray-900 underline decoration-brand-500 decoration-2 underline-offset-2">{content.title || "Portfolio"}</h1>
                  <div className="flex gap-6 text-sm font-medium uppercase tracking-wide text-gray-700">
                    <a href="#home" className="hover:text-brand-500">HOME</a>
                    <a href="#about" className="hover:text-brand-500">ABOUT</a>
                    <a href="#styleguide" className="hover:text-brand-500">STYLEGUIDE</a>
                  </div>
                </nav>
                {/* Hero / Intro */}
                <section
                  data-id="hero"
                  onClick={(e) => { e.stopPropagation(); onSelect("hero"); }}
                  className={`relative mt-10 rounded-lg p-4 ${selectedId === "hero" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  {selectedId === "hero" && (
                    <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Section</span>
                  )}
                  <div className="border-b border-brand-500 pb-2 mb-6 flex items-center justify-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500/60" aria-hidden />
                  </div>
                  <label className="text-xs font-medium text-brand-600" data-id="name-text" onClick={(e) => { e.stopPropagation(); onSelect("name-text"); }}>T Name Text</label>
                  <input
                    type="text"
                    value={content.heroHeading || "Jane Lo"}
                    onChange={(e) => onUpdateContent("heroHeading", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block w-full max-w-md rounded border border-brand-500/50 bg-white px-3 py-2 text-xl font-semibold text-gray-900"
                  />
                  <p className="mt-2 text-sm text-gray-500" data-id="paragraph-intro">{content.heroDescription || "Product Designer"}</p>
                  <p className="mt-6 text-3xl font-medium leading-tight text-black md:text-4xl" data-id="heading-jumbo">
                    Hey there! I&apos;m a creative graphic and web designer based in sunny San Francisco, CA.
                  </p>
                </section>
                {/* Works Grid - 4 project cards */}
                <section
                  data-id="works-section"
                  onClick={(e) => { e.stopPropagation(); onSelect("works-section"); }}
                  className={`relative mt-16 rounded-lg p-4 ${selectedId === "works-section" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2" data-id="works-grid">
                    {[
                      { id: "div-block-1", title: "Project 1", category: "Graphic Design" },
                      { id: "div-block-2", title: "Project 2", category: "Web Design" },
                      { id: "div-block-3", title: "Project 3", category: "Web Design" },
                      { id: "div-block-4", title: "Project 4", category: "Graphic Design" },
                    ].map(({ id, title, category }) => (
                      <div
                        key={id}
                        data-id={id}
                        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                        className={`rounded-lg border border-gray-200 overflow-hidden ${selectedId === id ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                      >
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-brand-600 font-medium" data-id={id === "div-block-1" ? "work-image-1" : undefined} onClick={(e) => { e.stopPropagation(); if (id === "div-block-1") onSelect("work-image-1"); }}>Work Image</span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                          <p className="text-sm text-gray-500">{category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                {/* My experience */}
                <section
                  data-id="work-experience-grid"
                  onClick={(e) => { e.stopPropagation(); onSelect("work-experience-grid"); }}
                  className={`relative mt-16 rounded-lg p-4 ${["work-experience-grid", "experience-container", "career-headline-wrap", "heading-experience", "paragraph-experience"].includes(selectedId ?? "") || selectedId?.startsWith("work-position") ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-4" data-id="heading-experience">My experience</h2>
                  <p className="text-gray-600 mb-8 max-w-2xl" data-id="paragraph-experience">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.
                  </p>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" data-id="work-experience-grid">
                    {[
                      { company: "Webflow", role: "Graphic Designer", period: "April 2014 — Mar 2015" },
                      { company: "Webflow", role: "Web Designer", period: "Apr 2015 — Mar 2016" },
                      { company: "Webflow", role: "Visual Developer", period: "Jun 2016 — Jul 2017" },
                      { company: "Webflow", role: "Dictator", period: "Aug 2017 — forever" },
                    ].map((item, i) => (
                      <div key={i} data-id={`work-position-${i + 1}`} onClick={(e) => { e.stopPropagation(); onSelect(`work-position-${i + 1}`); }} className="rounded border border-gray-200 p-4">
                        <p className="font-semibold text-gray-800">{item.company}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.role}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.period}</p>
                      </div>
                    ))}
                  </div>
                </section>
                {/* Contact */}
                <section
                  data-id="contact"
                  onClick={(e) => { e.stopPropagation(); onSelect("contact"); }}
                  className={`relative mt-16 rounded-lg overflow-hidden ${selectedId === "contact" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 px-6 py-12 md:px-10 md:py-16">
                    {selectedId === "contact" && (
                      <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Contact</span>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900">Want to get in touch?</h2>
                    <h3 className="text-2xl font-semibold text-gray-800 mt-1">Drop me a line!</h3>
                    <p className="mt-4 text-gray-600 max-w-xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Name</label>
                        <input type="text" placeholder="Enter your name" className="mt-2 w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Email Address</label>
                        <input type="email" placeholder="Enter your email" className="mt-2 w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600">Form Label</label>
                      <textarea placeholder="Enter your message" rows={4} className="mt-2 w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 resize-y" />
                    </div>
                    <button type="button" className="mt-6 rounded bg-emerald-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-800">Submit</button>
                  </div>
                </section>
                {/* Footer */}
                <footer
                  data-id="footer"
                  onClick={(e) => { e.stopPropagation(); onSelect("footer"); }}
                  className={`relative mt-0 border-t border-gray-200 bg-white py-6 ${selectedId === "footer" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  {selectedId === "footer" && (
                    <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Footer</span>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-xs font-bold text-white">W</span>
                    <span>POWERED BY WEBFLOW</span>
                  </div>
                </footer>
              </div>
              <div className="fixed bottom-4 right-[19rem] z-50 w-80 rounded-lg border border-gray-700 bg-gray-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2.5">
                  <span className="text-sm font-medium text-white">Get started {getStartedCount} of 8 complete!</span>
                  <button type="button" onClick={() => setGetStartedExpanded(!getStartedExpanded)} className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${getStartedExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-gray-700">
                  <div className="h-full bg-brand-500 transition-all" style={{ width: `${(getStartedCount / 8) * 100}%` }} />
                </div>
                {getStartedExpanded && (
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {GET_STARTED_ITEMS.map((label, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => toggleGetStarted(index)}
                          className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-gray-800"
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                              getStartedCompleted[index] ? "border-brand-500 bg-brand-500" : "border-gray-500 bg-transparent"
                            }`}
                          >
                            {getStartedCompleted[index] && <CheckLineIcon className="h-3.5 w-3.5 text-white" />}
                          </span>
                          <span className="flex-1 truncate">{label}</span>
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-xl text-gray-500 leading-none" aria-hidden>&gt;</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-72 shrink-0 flex-col border-l border-gray-700 bg-gray-900">
          <div className="border-b border-gray-700 px-3 py-2">
            <span className="text-sm font-medium text-white">{selectedLabel || "None Selected"}</span>
          </div>
          <div className="flex gap-1 border-b border-gray-700 px-2 py-1">
            {(["Style", "Properties", "Settings", "Interactions"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setPropertiesTab(tab)}
                className={`rounded px-3 py-1.5 text-xs font-medium ${propertiesTab === tab ? "bg-brand-500/20 text-brand-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 text-gray-300">
            {propertiesTab === "Style" && (
              <div>
                {!selectedId ? (
                  <p className="text-center text-sm text-gray-500">Select an element on the canvas to edit its style.</p>
                ) : (
                  <p className="text-xs text-gray-400">Style options for <strong className="text-white">{selectedLabel}</strong></p>
                )}
              </div>
            )}
            {propertiesTab === "Properties" && (
              <div className="space-y-3">
                {!selectedId || selectedId === "body" ? (
                  <>
                    <button type="button" onClick={onAddSection} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-600 py-2 text-xs font-medium text-brand-400 hover:border-brand-500">
                      <PlusIcon className="h-4 w-4" /> Add section
                    </button>
                  </>
                ) : selectedId === "hero" ? (
                  <>
                    <label className="block text-xs font-medium text-gray-400">Page title</label>
                    <input
                      value={content.title}
                      onChange={(e) => onUpdateContent("title", e.target.value)}
                      className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white"
                    />
                    <label className="block text-xs font-medium text-gray-400">Hero heading</label>
                    <input
                      value={content.heroHeading}
                      onChange={(e) => onUpdateContent("heroHeading", e.target.value)}
                      className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white"
                    />
                    <label className="block text-xs font-medium text-gray-400">Hero description</label>
                    <textarea
                      value={content.heroDescription}
                      onChange={(e) => onUpdateContent("heroDescription", e.target.value)}
                      rows={3}
                      className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white"
                    />
                  </>
                ) : content.sections.some((s) => s.id === selectedId) ? (
                  (() => {
                    const section = content.sections.find((s) => s.id === selectedId);
                    if (!section) return null;
                    return (
                      <>
                        <label className="block text-xs font-medium text-gray-400">Section title</label>
                        <input
                          value={section.title}
                          onChange={(e) => onUpdateSection(selectedId, { title: e.target.value })}
                          className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white"
                        />
                        <label className="block text-xs font-medium text-gray-400">Content</label>
                        <textarea
                          value={section.content}
                          onChange={(e) => onUpdateSection(selectedId, { content: e.target.value })}
                          rows={4}
                          className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveSection(selectedId)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:underline"
                        >
                          <TrashBinIcon className="h-4 w-4" /> Remove section
                        </button>
                      </>
                    );
                  })()
                ) : (
                  <p className="text-xs text-gray-500">No editable properties for this element.</p>
                )}
              </div>
            )}
            {propertiesTab === "Settings" && <p className="text-xs text-gray-500">Settings for the selected element.</p>}
            {propertiesTab === "Interactions" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-4">
                  <p className="text-center text-sm font-semibold text-white">Bring your site to life</p>
                  <p className="mt-2 text-center text-xs text-gray-400">Add animations and interactive behaviors. Powered by GSAP.</p>
                </div>
                <p className="text-xs font-medium text-gray-400">Trigger on...</p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>Click</li>
                  <li>Hover</li>
                  <li>Page load</li>
                  <li>Scroll</li>
                  <li>Custom event</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

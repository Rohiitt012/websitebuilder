"use client";

import Link from "next/link";
import React, { useMemo, useState, useRef, useEffect } from "react";
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
  UserCircleIcon,
  EyeIcon,
  DocsIcon,
  HorizontaLDots,
  TimeIcon,
  ArrowRightIcon,
  CheckLineIcon,
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

type NavNode = { id: string; label: string; children?: NavNode[] };

const EDITOR_TABS = ["Design", "CMS", "App Gen", "Insights"] as const;
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

type ElementStyle = {
  display: "block" | "flex" | "grid" | "none";
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  width: string;
  height: string;
  minW: string;
  minH: string;
  maxW: string;
  maxH: string;
};

const defaultElementStyle: ElementStyle = {
  display: "block",
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  width: "auto",
  height: "auto",
  minW: "0",
  minH: "0",
  maxW: "none",
  maxH: "none",
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

const NAV_FAKE_TO_REAL: Record<string, string> = {
  "hero-container": "hero",
  "hero-intro": "hero",
  "hero-t-name": "hero",
  "hero-t-para": "hero",
  "hero-h1": "hero",
};

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
  const selectId = (nodeId: string) => NAV_FAKE_TO_REAL[nodeId] ?? nodeId;
  const isSelected = (nodeId: string) => {
    const real = selectId(nodeId);
    return selectedId === real || selectedId === nodeId;
  };
  return (
    <ul className="space-y-0.5">
      {nodes.map((node) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = hasChildren && expandedIds.has(node.id);
        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => onSelect(selectId(node.id))}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition ${
                isSelected(node.id)
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              style={{ paddingLeft: `${8 + level * 12}px` }}
            >
              {hasChildren ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleExpand(node.id); }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleExpand(node.id); } }}
                  className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded hover:bg-gray-700"
                >
                  <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
                </span>
              ) : (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <BoxCubeIcon className="h-4 w-4 text-green-500" />
                </span>
              )}
              <span className="flex-1 truncate">{node.label}</span>
            </button>
            {hasChildren && isExpanded && (
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
  const [activeTab, setActiveTab] = React.useState<(typeof EDITOR_TABS)[number]>("Design");
  const [viewportPx, setViewportPx] = React.useState(1065);
  const [propertiesTab, setPropertiesTab] = React.useState<"Style" | "Properties" | "Settings" | "Interactions">("Style");
  const [elementStyles, setElementStyles] = React.useState<Record<string, Partial<ElementStyle>>>({});
  const [getStartedCompleted, setGetStartedCompleted] = React.useState<boolean[]>([
    true, false, false, false, false, true, false, false,
  ]);
  const [getStartedExpanded, setGetStartedExpanded] = React.useState(true);
  const [navigatorExpanded, setNavigatorExpanded] = useState<Set<string>>(new Set(["body", "hero", "hero-container", "hero-intro"]));
  const [homeDropdownOpen, setHomeDropdownOpen] = useState(false);
  const [homePageSearch, setHomePageSearch] = useState("");
  const [currentPage, setCurrentPage] = useState("Home");
  const homeDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!homeDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (homeDropdownRef.current && !homeDropdownRef.current.contains(e.target as Node)) setHomeDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [homeDropdownOpen]);
  const toggleNavigatorExpand = (id: string) => {
    setNavigatorExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStyle = (id: string): ElementStyle => ({ ...defaultElementStyle, ...elementStyles[id] });
  const setStyle = (id: string, updates: Partial<ElementStyle>) => {
    setElementStyles((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  };
  const getInlineStyle = (id: string): React.CSSProperties => {
    const s = getStyle(id);
    return {
      display: s.display,
      marginTop: s.marginTop ? `${s.marginTop}px` : 0,
      marginRight: s.marginRight ? `${s.marginRight}px` : 0,
      marginBottom: s.marginBottom ? `${s.marginBottom}px` : 0,
      marginLeft: s.marginLeft ? `${s.marginLeft}px` : 0,
      paddingTop: s.paddingTop ? `${s.paddingTop}px` : 0,
      paddingRight: s.paddingRight ? `${s.paddingRight}px` : 0,
      paddingBottom: s.paddingBottom ? `${s.paddingBottom}px` : 0,
      paddingLeft: s.paddingLeft ? `${s.paddingLeft}px` : 0,
      width: s.width || undefined,
      height: s.height || undefined,
      minWidth: s.minW !== "0" ? s.minW : undefined,
      minHeight: s.minH !== "0" ? s.minH : undefined,
      maxWidth: s.maxW !== "none" ? s.maxW : undefined,
      maxHeight: s.maxH !== "none" ? s.maxH : undefined,
    };
  };
  const getStartedCount = getStartedCompleted.filter(Boolean).length;
  const toggleGetStarted = (index: number) => {
    setGetStartedCompleted((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const navTree = useMemo((): NavNode[] => {
    const firstSection = content.sections[0];
    const heroSectionNode: NavNode = firstSection
      ? {
          id: "hero",
          label: "Section",
          children: [
            {
              id: "hero-container",
              label: "Container",
              children: [
                {
                  id: "hero-intro",
                  label: "Intro Wrap",
                  children: [
                    { id: "hero-t-name", label: "T Name Text" },
                    { id: "hero-t-para", label: "T Paragraph Li..." },
                    { id: "hero-h1", label: "H1 Heading Jum..." },
                  ],
                },
              ],
            },
          ],
        }
      : { id: "hero", label: "Section" };
    const restSections: NavNode[] = content.sections.slice(1).map((s) => ({
      id: s.id,
      label: "Section",
    }));
    return [
      {
        id: "body",
        label: "Body",
        children: [
          { id: "navigation", label: "Navigation" },
          heroSectionNode,
          ...restSections,
          { id: "contact", label: "Contact" },
          { id: "footer", label: "Footer" },
        ],
      },
    ];
  }, [content.sections]);

  const selectedLabel = useMemo(() => {
    if (!selectedId) return null;
    if (selectedId === "body") return "Body";
    if (selectedId === "navigation") return "Navigation";
    if (selectedId === "hero") return "Section";
    if (selectedId === "contact") return "Contact";
    if (selectedId === "footer") return "Footer";
    const s = content.sections.find((x) => x.id === selectedId);
    return s?.title || "Section";
  }, [selectedId, content.sections]);

  const breadcrumb = selectedId ? `Body > ${selectedLabel}` : "Body";

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
      {/* Top bar - full width, niche se content start */}
      <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-gray-700 bg-gray-800 px-3 py-2">
        <div className="flex items-center gap-0">
          {fullPage && (
            <Link href="/" className="mr-2 flex items-center gap-1 rounded px-2 py-1.5 text-xs text-gray-400 hover:bg-gray-700 hover:text-white">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back
            </Link>
          )}
          {[
            { id: "Design", icon: "monitor", label: "Design" },
            { id: "CMS", icon: "database", label: "CMS" },
            { id: "App Gen", icon: "code", label: "App Gen" },
            { id: "Insights", icon: "chart", label: "Insights" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as (typeof EDITOR_TABS)[number])}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium transition ${
                activeTab === tab.id ? "bg-brand-500/25 text-brand-300" : "text-gray-400 hover:bg-gray-700 hover:text-white"
              }`}
            >
              {tab.icon === "monitor" && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              {tab.icon === "database" && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>}
              {tab.icon === "code" && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
              {tab.icon === "chart" && <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4" /></svg>}
              <span>{tab.label}</span>
            </button>
          ))}
          <div className="mx-2 h-4 w-px bg-gray-600" />
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Undo">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6-6" /></svg>
          </button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Redo">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6-6m6 6l-6-6" /></svg>
          </button>
          <span className="ml-2 text-xs text-gray-400">{breadcrumb}</span>
        </div>
        <div ref={homeDropdownRef} className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <span className="text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M21 11v2.945a2.5 2.5 0 01-2.5 2.5h-.5a2 2 0 00-2 2v.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.945" /></svg>
          </span>
          <div className="h-4 w-px bg-gray-600" />
          <div className="relative">
            <button type="button" onClick={() => setHomeDropdownOpen((v) => !v)} className="flex items-center gap-1.5 rounded border border-gray-600 bg-gray-700/80 px-2.5 py-1.5 text-sm text-white hover:bg-gray-700">
              <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span>{currentPage}</span>
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            </button>
            {homeDropdownOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-1.5 w-80 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-600 bg-[#1e1e1e] shadow-2xl">
                <div className="max-h-[70vh] overflow-y-auto py-3">
                  {/* Current page - white heading, clear hierarchy */}
                  <div className="mb-3 flex items-center justify-between px-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Current page</span>
                    <div className="flex items-center gap-0.5">
                      <button type="button" className="rounded p-2 text-gray-400 hover:bg-gray-600 hover:text-white" title="Add page"><PlusIcon className="h-4 w-4" /></button>
                      <button type="button" className="rounded p-2 text-gray-400 hover:bg-gray-600 hover:text-white" title="Settings"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                    </div>
                  </div>
                  <div className="mx-3 mb-3 flex items-center gap-3 rounded-lg bg-gray-600/80 px-3 py-2.5">
                    {currentPage === "Home" ? <svg className="h-5 w-5 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> : <svg className="h-5 w-5 shrink-0 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    <span className="flex-1 truncate text-sm font-semibold text-white">{currentPage}</span>
                    <span role="button" tabIndex={0} className="cursor-pointer rounded p-1.5 text-gray-400 hover:bg-gray-500 hover:text-white"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>
                  </div>
                  {/* Search - blue focus ring, clear placeholder */}
                  <div className="mx-3 mb-3">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700/60 px-3 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <input type="text" value={homePageSearch} onChange={(e) => setHomePageSearch(e.target.value)} placeholder="Search pages and folders" className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-400 outline-none" />
                    </div>
                  </div>
                  {/* Pages + Utility - distinct background, white section labels */}
                  <div className="mx-3 rounded-lg bg-gray-800/80 px-3 py-3 ring-1 ring-gray-600/80">
                    <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-white">Pages</p>
                    <div className="space-y-0.5">
                      {["Home", "About", "Project 1 Work", "Project 2 Work", "Project 3 Work", "Project 4 Work", "Styleguide"].filter((p) => !homePageSearch || p.toLowerCase().includes(homePageSearch.toLowerCase())).map((name) => (
                        <button key={name} type="button" onClick={() => { setCurrentPage(name); setHomeDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${currentPage === name ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-700/80"}`}>
                          {name === "Home" ? <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> : <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                          <span className="flex-1 truncate font-medium">{name}</span>
                          {currentPage === name && <span role="button" tabIndex={0} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} className="rounded p-1.5 text-gray-400 hover:bg-gray-500 hover:text-white"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></span>}
                        </button>
                      ))}
                    </div>
                    <p className="mb-2 mt-4 px-1 text-xs font-bold uppercase tracking-wider text-white">Utility pages</p>
                    <div className="space-y-0.5">
                      {["Password", "404"].filter((p) => !homePageSearch || p.toLowerCase().includes(homePageSearch.toLowerCase())).map((name) => (
                        <button key={name} type="button" onClick={() => { setCurrentPage(name); setHomeDropdownOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${currentPage === name ? "bg-gray-600 text-white" : "text-gray-300 hover:bg-gray-700/80"}`}>
                          <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          <span className="flex-1 truncate font-medium">{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Manage all pages - clear CTA */}
                  <div className="mt-3 border-t border-gray-600 px-3 pt-3">
                    <button type="button" onClick={() => setHomeDropdownOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-200 transition hover:bg-gray-700/80 hover:text-white">
                      <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span>Manage all pages</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded border border-gray-600 bg-gray-700/50">
            {VIEWPORT_WIDTHS.map((w) => (
              <button key={w} type="button" onClick={() => setViewportPx(w)} className={`rounded px-2 py-1 text-xs font-medium transition ${viewportPx === w ? "bg-brand-500 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}>
                {w}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">{viewportPx}px</span>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Notifications"><BellIcon className="h-5 w-5" /></button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Profile">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">RC</div>
          </button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Comments">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Preview"><EyeIcon className="h-5 w-5" /></button>
          <button type="button" className="rounded-lg border border-gray-600 bg-gray-700/50 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">Share</button>
          <button type="button" className="flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">Publish<ChevronDownIcon className="h-4 w-4" /></button>
          <button type="button" onClick={onBuildNew} className="rounded-lg border border-gray-600 bg-gray-700/30 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700">Build new</button>
        </div>
      </div>

      {/* CURRENT PAGE bar - top bar ke niche, reference design */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-600 bg-gray-700/90 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Current page</span>
        <div className="flex items-center gap-1">
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white" title="Add page">
            <PlusIcon className="h-4 w-4" />
          </button>
          <button type="button" className="rounded p-1.5 text-gray-400 hover:bg-gray-600 hover:text-white" title="Page settings">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Niche se start: Icon strip + Navigator + Canvas + Properties */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: Icon strip */}
        <div className="flex w-12 shrink-0 flex-col border-r border-gray-700 bg-gray-900 dark:border-gray-700 dark:bg-gray-900">
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
        {/* Navigator panel - dark, reference design */}
        <div className="flex w-56 shrink-0 flex-col border-r border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2">
            <div className="flex items-center gap-2">
              <button type="button" onClick={onAddSection} title="Add element" className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                <PlusIcon className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-white">Navigator(A)</span>
            </div>
            <div className="flex gap-1">
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"><ChevronUpIcon className="h-4 w-4" /></button>
              <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z" /></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <NavigatorTree nodes={navTree} selectedId={selectedId} onSelect={onSelect} expandedIds={navigatorExpanded} onToggleExpand={toggleNavigatorExpand} />
          </div>
        </div>

        {/* Canvas + Right panel row */}
        <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="relative flex-1 overflow-auto bg-gray-800/30 p-6">
          <div className="relative mx-auto min-h-full rounded-lg border border-gray-600 bg-white shadow-xl" style={{ maxWidth: `${viewportPx}px` }}>
            <div className="rounded-lg p-6 md:p-10">
              <h1 className="border-b border-gray-200 pb-2 text-2xl font-semibold text-gray-900 md:text-3xl">{content.title || "Portfolio"}</h1>
              <nav className="mt-4 flex gap-6 text-sm font-medium text-gray-600">
                <a href="#home" className="hover:text-brand-500">HOME</a>
                <a href="#about" className="hover:text-brand-500">ABOUT</a>
                <a href="#styleguide" className="hover:text-brand-500">STYLEGUIDE</a>
              </nav>
              <section data-id="hero" onClick={(e) => { e.stopPropagation(); onSelect("hero"); }} style={getInlineStyle("hero")} className={`relative mt-10 rounded-lg p-4 ${selectedId === "hero" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}>
                {selectedId === "hero" && <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white shadow">Section</span>}
                <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">{content.heroHeading || "Jane Lo"}</h2>
                <p className="mt-1 text-sm text-gray-500">{content.heroDescription || "Product Designer"}</p>
                <p className="mt-6 text-3xl font-medium leading-tight text-black md:text-4xl">{content.heroDescription?.trim() ? content.heroDescription : "based in sunny San Francisco, CA."}</p>
              </section>
              {content.sections.map((section, idx) => (
                <React.Fragment key={section.id}>
                  <div className="mt-8 h-px w-full border-t border-dashed border-gray-300" aria-hidden />
                  <section data-id={section.id} onClick={(e) => { e.stopPropagation(); onSelect(section.id); }} style={getInlineStyle(section.id)} className={`relative rounded-lg border border-gray-200 p-4 ${selectedId === section.id ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}>
                    {selectedId === section.id && <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white shadow">Section</span>}
                    <h3 className="text-lg font-medium text-gray-800">{section.title}</h3>
                    <p className="mt-2 text-sm text-gray-600">{section.content}</p>
                  </section>
                </React.Fragment>
              ))}
              <div className="mt-8 h-px w-full border-t border-dashed border-gray-300" aria-hidden />
              <section data-id="contact" onClick={(e) => { e.stopPropagation(); onSelect("contact"); }} style={getInlineStyle("contact")} className={`relative rounded-lg p-4 ${selectedId === "contact" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}>
                {selectedId === "contact" && <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white shadow">Contact</span>}
                <h3 className="text-lg font-medium text-gray-800">Contact</h3>
                <p className="mt-2 text-sm text-gray-600">Get in touch.</p>
              </section>
              <div className="mt-8 h-px w-full border-t border-dashed border-gray-300" aria-hidden />
              <footer data-id="footer" onClick={(e) => { e.stopPropagation(); onSelect("footer"); }} style={getInlineStyle("footer")} className={`relative mt-8 rounded-lg border-t border-gray-200 pt-6 ${selectedId === "footer" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}>
                {selectedId === "footer" && <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white shadow">Footer</span>}
                <p className="text-sm text-gray-500">© {new Date().getFullYear()} {content.title || "Portfolio"}. All rights reserved.</p>
              </footer>
            </div>
            <div className="absolute bottom-4 right-4 w-80 rounded-lg border border-gray-700 bg-gray-900 shadow-xl dark:bg-gray-950">
              <div className="flex items-center justify-between border-b border-gray-700 px-3 py-2.5 dark:border-gray-800">
                <span className="text-sm font-medium text-white">Get started {getStartedCount} of 8 complete!</span>
                <div className="flex items-center gap-1">
                  <button type="button" className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white"><HorizontaLDots className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setGetStartedExpanded(!getStartedExpanded)} className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white">
                    <ChevronDownIcon className={`h-4 w-4 transition-transform ${getStartedExpanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-b-lg bg-gray-700">
                <div className="h-full rounded-b-lg bg-brand-500 transition-all" style={{ width: `${(getStartedCount / 8) * 100}%` }} />
              </div>
              {getStartedExpanded && (
                <>
                  <p className="border-b border-gray-700 px-3 py-2 text-xs text-gray-400 dark:border-gray-800">Build your site faster with these essentials:</p>
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {GET_STARTED_ITEMS.map((label, index) => (
                      <li key={index}>
                        <button type="button" onClick={() => toggleGetStarted(index)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-white hover:bg-gray-800">
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${getStartedCompleted[index] ? "border-brand-500 bg-brand-500" : "border-gray-500 bg-transparent"}`}>
                            {getStartedCompleted[index] && <CheckLineIcon className="h-3.5 w-3.5 text-white" />}
                          </span>
                          <span className="flex-1 truncate">{label}</span>
                          <ArrowRightIcon className="h-4 w-4 shrink-0 text-gray-500" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

      {/* Right: Properties panel - dark, reference design */}
      <div className="flex w-72 shrink-0 flex-col border-l border-gray-700 bg-gray-900">
        <div className="border-b border-gray-700 px-3 py-2">
          <span className="text-sm font-medium text-white">{selectedLabel || "None Selected"}</span>
        </div>
        <div className="flex gap-1 border-b border-gray-700 px-2 py-1">
          {(["Style", "Properties", "Settings", "Interactions"] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setPropertiesTab(tab)} className={`rounded px-3 py-1.5 text-xs font-medium ${propertiesTab === tab ? "bg-brand-500/20 text-brand-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 text-gray-300">
          {propertiesTab === "Style" && (
            <>
              <label className="mb-1 block text-xs font-medium text-gray-400">Style selector</label>
              <div className="mb-4">
                {selectedId ? (
                  <button type="button" className="rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-left text-xs font-medium text-brand-400">* {selectedLabel}</button>
                ) : (
                  <span className="text-xs text-gray-500">None</span>
                )}
              </div>
              {!selectedId ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 py-12">
                  <svg className="mb-3 h-10 w-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                  <p className="text-center text-sm font-medium text-gray-400">Make a selection</p>
                  <p className="mt-1 text-center text-xs text-gray-500">Select an element on the canvas to activate this panel.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-400">Layout</p>
                    <div className="flex gap-1">
                      {(["block", "flex", "grid", "none"] as const).map((d) => (
                        <button key={d} type="button" onClick={() => setStyle(selectedId!, { display: d })} className={`rounded border px-2 py-1 text-xs capitalize ${getStyle(selectedId!).display === d ? "border-brand-500 bg-brand-500/20 text-brand-400" : "border-gray-600 text-gray-400 hover:bg-gray-800"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-400">Spacing</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(["marginTop", "marginRight", "marginBottom", "marginLeft"] as const).map((key) => (
                        <div key={key}>
                          <label className="text-gray-500">{key.replace("margin", "")}</label>
                          <input type="number" value={getStyle(selectedId!)[key] ?? 0} onChange={(e) => setStyle(selectedId!, { [key]: Number(e.target.value) || 0 })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" />
                        </div>
                      ))}
                      {(["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const).map((key) => (
                        <div key={key}>
                          <label className="text-gray-500">{key.replace("padding", "")}</label>
                          <input type="number" value={getStyle(selectedId!)[key] ?? 0} onChange={(e) => setStyle(selectedId!, { [key]: Number(e.target.value) || 0 })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-gray-400">Size</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex gap-2">
                        <div className="flex-1"><label className="text-gray-500">Width</label><input type="text" value={getStyle(selectedId!).width} onChange={(e) => setStyle(selectedId!, { width: e.target.value })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" /></div>
                        <div className="flex-1"><label className="text-gray-500">Height</label><input type="text" value={getStyle(selectedId!).height} onChange={(e) => setStyle(selectedId!, { height: e.target.value })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" /></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1"><label className="text-gray-500">Min W</label><input type="text" value={getStyle(selectedId!).minW} onChange={(e) => setStyle(selectedId!, { minW: e.target.value })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" /></div>
                        <div className="flex-1"><label className="text-gray-500">Min H</label><input type="text" value={getStyle(selectedId!).minH} onChange={(e) => setStyle(selectedId!, { minH: e.target.value })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" /></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1"><label className="text-gray-500">Max W</label><input type="text" value={getStyle(selectedId!).maxW} onChange={(e) => setStyle(selectedId!, { maxW: e.target.value })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" /></div>
                        <div className="flex-1"><label className="text-gray-500">Max H</label><input type="text" value={getStyle(selectedId!).maxH} onChange={(e) => setStyle(selectedId!, { maxH: e.target.value })} className="mt-0.5 w-full rounded border border-gray-600 bg-gray-800 px-2 py-1 text-white" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {propertiesTab === "Properties" && (
            <>
              {!selectedId || selectedId === "body" ? (
                <>
                  <div className="mb-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/50 py-8">
                    <BoxCubeIcon className="mb-3 h-12 w-12 text-gray-500" />
                    <p className="mb-2 text-sm font-medium text-gray-300">No properties yet</p>
                    <p className="mb-4 text-center text-xs text-gray-500">Edit the component to create or manage properties</p>
                    <button type="button" className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">Edit component</button>
                  </div>
                  <button type="button" onClick={onAddSection} className="mb-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-600 py-2 text-xs font-medium text-brand-400 hover:border-brand-500"><PlusIcon className="h-4 w-4" /> Add section</button>
                  <p className="mt-4 text-xs text-gray-500">Create reusable components</p>
                  <p className="mt-2 text-xs text-gray-500">Properties let you edit component instances&apos; content without affecting other instances.</p>
                </>
              ) : selectedId === "hero" ? (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Page title</label>
                  <input value={content.title} onChange={(e) => onUpdateContent("title", e.target.value)} className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white" />
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Hero heading</label>
                  <input value={content.heroHeading} onChange={(e) => onUpdateContent("heroHeading", e.target.value)} className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white" />
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Hero description</label>
                  <textarea value={content.heroDescription} onChange={(e) => onUpdateContent("heroDescription", e.target.value)} rows={3} className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white" />
                </div>
              ) : content.sections.some((s) => s.id === selectedId) ? (
                (() => {
                  const section = content.sections.find((s) => s.id === selectedId);
                  if (!section) return null;
                  return (
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Section title</label>
                      <input value={section.title} onChange={(e) => onUpdateSection(selectedId, { title: e.target.value })} className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white" />
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Content</label>
                      <textarea value={section.content} onChange={(e) => onUpdateSection(selectedId, { content: e.target.value })} rows={4} className="w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white" />
                      <button type="button" onClick={() => onRemoveSection(selectedId)} className="flex items-center gap-1 text-xs text-red-500 hover:underline"><TrashBinIcon className="h-4 w-4" /> Remove section</button>
                    </div>
                  );
                })()
              ) : (
                <>
                  <div className="mb-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/50 py-8">
                    <BoxCubeIcon className="mb-3 h-12 w-12 text-gray-500" />
                    <p className="mb-2 text-sm font-medium text-gray-300">No properties yet</p>
                    <p className="mb-4 text-center text-xs text-gray-500">Edit the component to create or manage properties</p>
                    <button type="button" className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600">Edit component</button>
                  </div>
                  <p className="text-xs text-gray-500">Create reusable components</p>
                  <p className="mt-2 text-xs text-gray-500">Properties let you edit component instances&apos; content without affecting other instances.</p>
                </>
              )}
              <div className="mt-4 flex gap-2">
                {["Design", "Pages", "UI kits"].map((label) => (
                  <div key={label} className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded border border-gray-700 bg-gray-800 text-xs text-gray-500">{label}</div>
                ))}
              </div>
              <button type="button" className="mt-2 text-xs text-gray-500 hover:underline">Hide this</button>
            </>
          )}
          {propertiesTab === "Settings" && <p className="text-xs text-gray-500 dark:text-gray-400">Settings for the selected element.</p>}
          {propertiesTab === "Interactions" && (
            <div className="space-y-5">
              <div className="rounded-lg border border-gray-700 bg-gray-800/80 p-5">
                <div className="mb-4 flex justify-center">
                  <svg className="h-14 w-14 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-center text-sm font-semibold text-white">Bring your site to life</h3>
                <p className="mt-2 text-center text-xs text-gray-400">Add animations and interactive behaviors to any element.</p>
                <a href="#" className="mt-3 block text-center text-xs text-brand-400 hover:underline">Powered by GSAP</a>
              </div>
              <div>
                <h4 className="mb-3 text-xs font-medium text-gray-300">Trigger on...</h4>
                <ul className="space-y-2">
                  {[
                    { label: "Click", icon: "click" },
                    { label: "Hover", icon: "hover" },
                    { label: "Page load", icon: "page" },
                    { label: "Scroll", icon: "scroll" },
                    { label: "Custom event", icon: "code" },
                  ].map((item) => (
                    <li key={item.label}>
                      <button type="button" className="flex w-full items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-left text-sm text-gray-300 transition hover:border-gray-600 hover:bg-gray-800">
                        {item.icon === "click" && (
                          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5m0-5l5-5" /></svg>
                        )}
                        {item.icon === "hover" && (
                          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-8 4h8M4 7v10M20 7v10" /></svg>
                        )}
                        {item.icon === "page" && (
                          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                        {item.icon === "scroll" && (
                          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                        )}
                        {item.icon === "code" && (
                          <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        )}
                        <span>{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">Version</label>
                <button type="button" className="flex w-full items-center justify-between rounded-lg border border-gray-600 bg-gray-800 px-3 py-2.5 text-left text-sm text-gray-300">
                  <span>Interactions with GSAP (new)</span>
                  <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

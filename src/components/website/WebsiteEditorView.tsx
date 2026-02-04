"use client";

import Link from "next/link";
import React, { useState, useMemo, useRef, useEffect } from "react";
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
  ChevronLeftIcon,
  ChevronUpIcon,
  BellIcon,
  EyeIcon,
  DocsIcon,
  HorizontaLDots,
  TimeIcon,
  CheckLineIcon,
  PageIcon,
} from "@/icons";
import PagesSparkleIcon from "@/icons/ai-icon-socialxn.svg";

export type WebsiteSection = {
  id: string;
  title: string;
  content: string;
};

/** Default text for every editable block on canvas – prompt se koi bhi part change ho sakta hai */
export const DEFAULT_CANVAS_COPY: Record<string, string> = {
  experienceHeading: "My experience",
  experienceParagraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  work1Title: "Project 1",
  work1Category: "Graphic Design",
  work2Title: "Project 2",
  work2Category: "Web Design",
  work3Title: "Project 3",
  work3Category: "Web Design",
  work4Title: "Project 4",
  work4Category: "Graphic Design",
  exp1Company: "Webflow",
  exp1Role: "Graphic Designer",
  exp1Period: "April 2014 — Mar 2015",
  exp2Company: "Webflow",
  exp2Role: "Web Designer",
  exp2Period: "Apr 2015 — Mar 2016",
  exp3Company: "Webflow",
  exp3Role: "Visual Developer",
  exp3Period: "Jun 2016 — Jul 2017",
  exp4Company: "Webflow",
  exp4Role: "Dictator",
  exp4Period: "Aug 2017 — forever",
  contactHeading: "Want to get in touch?",
  contactSubheading: "Drop me a line!",
  contactParagraph: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  footerText: "POWERED BY WEBFLOW",
  sectionNew1Title: "Card 1",
  sectionNew1Category: "Category",
  sectionNew2Title: "Card 2",
  sectionNew2Category: "Category",
  sectionNew3Title: "Card 3",
  sectionNew3Category: "Category",
  sectionNew4Title: "Card 4",
  sectionNew4Category: "Category",
};

export type WebsiteContent = {
  title: string;
  heroHeading: string;
  heroDescription: string;
  heroJumboText?: string;
  /** Har canvas block ki copy – prompt se koi bhi key update ho sakti hai */
  canvasCopy?: Record<string, string>;
  sections: WebsiteSection[];
};

function getCanvasCopy(content: WebsiteContent, key: string, fallback: string): string {
  return content.canvasCopy?.[key] ?? DEFAULT_CANVAS_COPY[key] ?? fallback;
}

type NavNode = {
  id: string;
  label: string;
  children?: NavNode[];
  collapsible?: boolean;
  iconType?: "body" | "cube" | "section" | "sectionCollapsible" | "text" | "h1" | "h2" | "p" | "link" | "grid" | "divBlock";
};

/** Per-element style overrides for the Style panel (applied as inline styles on canvas). */
export type ElementStyle = {
  display?: "block" | "flex" | "grid" | "none" | "inline" | "inline-block";
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  overflow?: "visible" | "hidden" | "scroll" | "auto";
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  fontFamily?: string;
  fontWeight?: string | number;
  fontSize?: string;
  lineHeight?: string;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  textDecoration?: "none" | "underline" | "line-through" | "overline";
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted" | "double";
  borderColor?: string;
  opacity?: number;
  mixBlendMode?: string;
  cursor?: string;
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

/** Breakpoints with device icon type. Add/change sizes here. */
const VIEWPORT_BREAKPOINTS = [
  { width: 1065, label: "Desktop", icon: "desktop" as const },
  { width: 992, label: "Desktop", icon: "desktop" as const },
  { width: 768, label: "Tablet", icon: "tablet" as const },
  { width: 479, label: "Mobile L", icon: "phone" as const },
  { width: 375, label: "Mobile", icon: "phone" as const },
];

function ViewportDeviceIcon({ type, isBase, className = "h-4 w-4" }: { type: "desktop" | "tablet" | "phone"; isBase?: boolean; className?: string }) {
  const c = "currentColor";
  if (type === "desktop") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="3" width="20" height="14" rx="1" />
        <path d="M8 21h8M12 17v4" />
        {isBase && <circle cx="18" cy="6" r="1.5" fill={c} />}
      </svg>
    );
  }
  if (type === "tablet") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="6" width="20" height="12" rx="1" />
        <path d="M12 20v-2" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function getViewportCategory(viewportPx: number): "mobile" | "tablet" | "desktop" {
  if (viewportPx <= 479) return "mobile";
  if (viewportPx <= 768) return "tablet";
  return "desktop";
}
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
  parentId,
  onReorder,
  getNodeLabel,
  onRename,
}: {
  nodes: NavNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  level?: number;
  parentId?: string;
  onReorder?: (parentId: string, fromIndex: number, toIndex: number) => void;
  getNodeLabel?: (node: NavNode) => string;
  onRename?: (nodeId: string, newLabel: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const iconWrapperClass = "flex h-6 w-6 min-w-[1.5rem] shrink-0 items-center justify-center overflow-visible p-0.5 mr-0.5 [&>svg]:size-5 [&>svg]:shrink-0";
  const canDrag = parentId != null && typeof onReorder === "function";
  const displayLabel = getNodeLabel ? (node: NavNode) => getNodeLabel(node) : (node: NavNode) => node.label;

  return (
    <ul className={level === 0 ? "space-y-0.5" : "ml-3 mt-0.5 space-y-0.5 border-l border-gray-700 pl-2"}>
      {nodes.map((node, index) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpandable = node.id === "body" || !!node.collapsible;
        const isExpanded = expandedIds.has(node.id);
        const isSelected = selectedId === node.id;
        const isCubeNode = node.iconType === "cube";

        return (
          <li
            key={node.id}
            draggable={canDrag}
            onDragStart={canDrag ? (e) => { e.stopPropagation(); e.dataTransfer.setData("text/plain", String(index)); e.dataTransfer.effectAllowed = "move"; } : undefined}
            onDragOver={canDrag ? (e) => { e.preventDefault(); e.stopPropagation(); e.dataTransfer.dropEffect = "move"; e.currentTarget.classList.add("opacity-70"); } : undefined}
            onDragLeave={canDrag ? (e) => { e.currentTarget.classList.remove("opacity-70"); } : undefined}
            onDrop={canDrag ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.remove("opacity-70");
              const fromIndex = Number(e.dataTransfer.getData("text/plain"));
              if (Number.isNaN(fromIndex) || fromIndex === index || parentId == null) return;
              onReorder(parentId, fromIndex, index);
            } : undefined}
            className={canDrag ? "cursor-grab active:cursor-grabbing rounded transition-opacity" : ""}
          >
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
                    <ChevronLeftIcon className="h-5 w-5 rotate-180 text-gray-400" />
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
                onDoubleClick={(e) => {
                  if (onRename) {
                    e.preventDefault();
                    setEditingId(node.id);
                    setEditingValue(displayLabel(node));
                  }
                }}
                title={onRename ? "Double-click to rename" : undefined}
                className={`min-w-0 flex-1 rounded px-2 py-1.5 text-left text-sm transition ${
                  isSelected ? "bg-green-500/20 text-green-400" : isCubeNode ? "text-green-400 hover:bg-gray-800 hover:text-green-300" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {editingId === node.id ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => {
                      onRename?.(node.id, editingValue.trim());
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onRename?.(node.id, editingValue.trim());
                        setEditingId(null);
                      }
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditingValue(displayLabel(node));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="min-w-0 w-full rounded border border-brand-500 bg-gray-800 px-1.5 py-0.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                    autoFocus
                  />
                ) : (
                  <span className="break-words">{displayLabel(node)}</span>
                )}
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
                parentId={node.id}
                onReorder={onReorder}
                getNodeLabel={getNodeLabel}
                onRename={onRename}
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
  const [viewportDropdownOpen, setViewportDropdownOpen] = useState<number | null>(null);
  const viewportDropdownRef = useRef<HTMLDivElement>(null);
  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const [propertiesTab, setPropertiesTab] = useState<"Style" | "Properties" | "Settings" | "Interactions">("Style");
  const [getStartedCompleted, setGetStartedCompleted] = useState<boolean[]>([true, false, false, false, false, false, false, false]);
  const [getStartedExpanded, setGetStartedExpanded] = useState(true);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (viewportDropdownRef.current && !viewportDropdownRef.current.contains(event.target as Node)) {
        setViewportDropdownOpen(null);
      }
    }
    if (viewportDropdownOpen !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [viewportDropdownOpen]);

  const viewportCategory = getViewportCategory(viewportPx);
  const getStartedCount = getStartedCompleted.filter(Boolean).length;
  const toggleGetStarted = (index: number) => {
    setGetStartedCompleted((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const getInitialNavTree = (): NavNode[] => [
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
          {
            id: "section-new",
            label: "Section",
            collapsible: true,
            iconType: "sectionCollapsible",
            children: [
              {
                id: "section-new-grid",
                label: "Works Grid",
                collapsible: true,
                iconType: "grid",
                children: [
                  { id: "section-new-div-1", label: "Div Block", collapsible: true, iconType: "divBlock" },
                  { id: "section-new-div-2", label: "Div Block", collapsible: true, iconType: "divBlock" },
                  { id: "section-new-div-3", label: "Div Block", collapsible: true, iconType: "divBlock" },
                  { id: "section-new-div-4", label: "Div Block", collapsible: true, iconType: "divBlock" },
                ],
              },
            ],
          },
          { id: "contact", label: "Contact", iconType: "cube" },
          { id: "footer", label: "Footer", iconType: "cube" },
        ],
      },
    ];

  const [navTree, setNavTree] = useState<NavNode[]>(getInitialNavTree);

  function updateNodeInTree(nodes: NavNode[], targetId: string, update: (node: NavNode) => NavNode): NavNode[] {
    return nodes.map((node) => {
      if (node.id === targetId) return update(node);
      if (node.children?.length) {
        return { ...node, children: updateNodeInTree(node.children, targetId, update) };
      }
      return node;
    });
  }

  const reorderChildren = (parentId: string, fromIndex: number, toIndex: number) => {
    setNavTree((prev) =>
      updateNodeInTree(prev, parentId, (node) => {
        const children = [...(node.children || [])];
        if (fromIndex < 0 || fromIndex >= children.length || toIndex < 0 || toIndex >= children.length) return node;
        const [removed] = children.splice(fromIndex, 1);
        children.splice(toIndex, 0, removed);
        return { ...node, children };
      })
    );
  };

  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});
  const getNodeLabel = (node: NavNode) => customLabels[node.id] ?? node.label;
  const handleRename = (nodeId: string, newLabel: string) => {
    setCustomLabels((prev) => {
      if (!newLabel.trim()) {
        const next = { ...prev };
        delete next[nodeId];
        return next;
      }
      return { ...prev, [nodeId]: newLabel.trim() };
    });
  };

  const [elementStyles, setElementStyles] = useState<Record<string, Partial<ElementStyle>>>({});
  const updateElementStyle = (id: string, partial: Partial<ElementStyle>) => {
    setElementStyles((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };
  const getElementStyle = (id: string): React.CSSProperties => {
    const s = elementStyles[id];
    if (!s) return {};
    const out: React.CSSProperties = {};
    if (s.display != null) out.display = s.display;
    if (s.marginTop != null) out.marginTop = s.marginTop;
    if (s.marginRight != null) out.marginRight = s.marginRight;
    if (s.marginBottom != null) out.marginBottom = s.marginBottom;
    if (s.marginLeft != null) out.marginLeft = s.marginLeft;
    if (s.paddingTop != null) out.paddingTop = s.paddingTop;
    if (s.paddingRight != null) out.paddingRight = s.paddingRight;
    if (s.paddingBottom != null) out.paddingBottom = s.paddingBottom;
    if (s.paddingLeft != null) out.paddingLeft = s.paddingLeft;
    if (s.width != null) out.width = s.width;
    if (s.height != null) out.height = s.height;
    if (s.minWidth != null) out.minWidth = s.minWidth;
    if (s.minHeight != null) out.minHeight = s.minHeight;
    if (s.maxWidth != null) out.maxWidth = s.maxWidth;
    if (s.maxHeight != null) out.maxHeight = s.maxHeight;
    if (s.overflow != null) out.overflow = s.overflow;
    if (s.position != null) out.position = s.position;
    if (s.fontFamily != null) out.fontFamily = s.fontFamily;
    if (s.fontWeight != null) out.fontWeight = s.fontWeight;
    if (s.fontSize != null) out.fontSize = s.fontSize;
    if (s.lineHeight != null) out.lineHeight = s.lineHeight;
    if (s.color != null) out.color = s.color;
    if (s.textAlign != null) out.textAlign = s.textAlign;
    if (s.textDecoration != null) out.textDecoration = s.textDecoration;
    if (s.backgroundColor != null) out.backgroundColor = s.backgroundColor;
    if (s.borderRadius != null) out.borderRadius = s.borderRadius;
    if (s.borderWidth != null) out.borderWidth = s.borderWidth;
    if (s.borderStyle != null) out.borderStyle = s.borderStyle;
    if (s.borderColor != null) out.borderColor = s.borderColor;
    if (s.opacity != null) out.opacity = s.opacity;
    if (s.mixBlendMode != null) out.mixBlendMode = s.mixBlendMode;
    if (s.cursor != null) out.cursor = s.cursor;
    return out;
  };

  const [styleSectionsExpanded, setStyleSectionsExpanded] = useState<Record<string, boolean>>({
    Layout: true,
    Spacing: true,
    Size: true,
    Position: true,
    Typography: true,
    Backgrounds: true,
    Borders: true,
    Effects: true,
  });
  const toggleStyleSection = (key: string) => {
    setStyleSectionsExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const WEBSITE_PROMPTS = [
    { id: "fashion-designer", label: "Fashion Designer" },
    { id: "business-website", label: "Business Website" },
    { id: "food-delivery", label: "Food Delivery Website" },
    { id: "mobile-friendly", label: "Mobile Friendly Design" },
    { id: "adaptive-layouts", label: "Adaptive Layouts" },
    { id: "fast-performance", label: "Fast Performance" },
    { id: "cross-device", label: "Cross Device Support" },
  ] as const;

  const [autoApi, setAutoApi] = useState<"gemini" | "chatgpt" | "grok" | "none">("gemini");
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [leftPanelView, setLeftPanelView] = useState<"navigator" | "add-features">("navigator");
  const [promptInput, setPromptInput] = useState("");
  const [pastChats, setPastChats] = useState<{ id: string; title: string; createdAt: number }[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { role: "user" | "assistant"; content: string }[]>>({});
  const [chatLoading, setChatLoading] = useState(false);

  const startNewChat = () => {
    setPromptInput("");
    setActiveChatId(null);
  };

  const submitPrompt = async () => {
    const text = promptInput.trim();
    if (!text) return;
    const id = `chat-${Date.now()}`;
    const title = text.length > 45 ? text.slice(0, 42) + "…" : text;
    setPastChats((prev) => [{ id, title, createdAt: Date.now() }, ...prev.slice(0, 19)]);
    setActiveChatId(id);
    setPromptInput("");

    setChatMessages((prev) => ({ ...prev, [id]: [{ role: "user", content: text }] }));

    if (autoApi === "gemini" || autoApi === "grok" || autoApi === "chatgpt") {
      setChatLoading(true);
      try {
        const res = await fetch("/api/website-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            provider: autoApi,
            currentContent: {
              title: content.title,
              heroHeading: content.heroHeading,
              heroDescription: content.heroDescription,
              heroJumboText: content.heroJumboText ?? "",
              canvasCopy: content.canvasCopy ?? {},
            },
          }),
        });
        const data = await res.json();
        const assistantText = res.ok && data.text ? data.text : data?.error ?? "Sorry, something went wrong.";
        setChatMessages((prev) => ({
          ...prev,
          [id]: [...(prev[id] ?? []), { role: "assistant", content: assistantText }],
        }));
        if (res.ok && data.updates && typeof data.updates === "object") {
          const u = data.updates as Record<string, unknown>;
          if (typeof u.title === "string") onUpdateContent("title", u.title);
          if (typeof u.heroHeading === "string") onUpdateContent("heroHeading", u.heroHeading);
          if (typeof u.heroDescription === "string") onUpdateContent("heroDescription", u.heroDescription);
          if (typeof u.heroJumboText === "string") onUpdateContent("heroJumboText", u.heroJumboText);
          if (u.canvasCopy && typeof u.canvasCopy === "object" && !Array.isArray(u.canvasCopy)) {
            const next = { ...(content.canvasCopy ?? {}), ...(u.canvasCopy as Record<string, string>) };
            onUpdateContent("canvasCopy", next);
          }
        }
      } catch {
        setChatMessages((prev) => ({
          ...prev,
          [id]: [...(prev[id] ?? []), { role: "assistant", content: "Request failed. Check your connection and try again." }],
        }));
      } finally {
        setChatLoading(false);
      }
    } else {
      const msg = autoApi === "none" ? "No AI provider selected. Choose Gemini, ChatGPT, or Grok from the Auto menu to get a response." : "Choose Gemini, ChatGPT, or Grok from the Auto menu.";
      setChatMessages((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), { role: "assistant", content: msg }] }));
    }
  };

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(["body", "hero", "works-section", "section-new"]));
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
      "section-new": "Section",
      "section-new-grid": "Works Grid",
      "section-new-div-1": "Div Block",
      "section-new-div-2": "Div Block",
      "section-new-div-3": "Div Block",
      "section-new-div-4": "Div Block",
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
    return customLabels[selectedId] ?? labels[selectedId] ?? selectedId.replace(/-/g, " ");
  }, [selectedId, customLabels]);

  const leftIcons = [
    { Icon: PlusIcon, title: "Add" },
    { Icon: PagesSparkleIcon, title: "Pages" },
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
          <div className="relative" ref={viewportDropdownRef}>
            <div className="flex items-center gap-0.5 rounded border border-gray-600 bg-gray-700/50 p-0.5">
              {VIEWPORT_BREAKPOINTS.map((bp, index) => (
                <button
                  key={bp.width}
                  type="button"
                  onClick={() => {
                    setViewportPx(bp.width);
                    setViewportDropdownOpen((prev) => (prev === bp.width ? null : bp.width));
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded transition ${viewportPx === bp.width ? "bg-brand-500 text-white" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
                  title={`${bp.label}: ${bp.width}px`}
                  aria-label={`${bp.label} ${bp.width}px`}
                  aria-expanded={viewportDropdownOpen === bp.width}
                >
                  <ViewportDeviceIcon type={bp.icon} isBase={index === 0} className="h-4 w-4 shrink-0" />
                </button>
              ))}
            </div>
            {viewportDropdownOpen !== null && (() => {
              const idx = VIEWPORT_BREAKPOINTS.findIndex((b) => b.width === viewportDropdownOpen);
              const bp = idx >= 0 ? VIEWPORT_BREAKPOINTS[idx] : null;
              if (!bp) return null;
              const index = idx + 1;
              const isBase = index === 1;
              const title = isBase
                ? `${bp.label}: * Base breakpoint (${index})`
                : `${bp.label} — ${bp.width}px (${index})`;
              const description = isBase
                ? `${bp.label} styles apply at all breakpoints, unless they're edited at a larger or smaller breakpoint. Start your styling here.`
                : `Styles added here will apply at ${bp.width}px and down, unless they're edited at a smaller breakpoint.`;
              return (
                <div className="absolute left-1/2 top-full z-50 mt-1.5 -translate-x-1/2">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-700" />
                  <div className="min-w-[240px] rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 shadow-xl">
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-xs leading-snug text-gray-300">{description}</p>
                  </div>
                </div>
              );
            })()}
          </div>
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
            <button type="button" onClick={() => setLeftPanelView("navigator")} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded p-2 hover:bg-gray-800 ${leftPanelView === "navigator" ? "text-white" : "text-gray-400"}`} title="Add">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
                <PlusIcon className="h-5 w-5 shrink-0" />
              </span>
            </button>
            {leftIcons.slice(1).map(({ Icon, title }) => {
              const isPages = title === "Pages";
              const isActive = isPages && leftPanelView === "add-features";
              return (
                <button
                  key={title}
                  type="button"
                  title={title}
                  onClick={() => setLeftPanelView(isPages ? "add-features" : "navigator")}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded p-2 hover:bg-gray-800 ${isActive ? "text-white" : "text-gray-400"}`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
                    <Icon className="h-5 w-5 shrink-0" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex w-72 shrink-0 flex-col border-r border-gray-700 bg-gray-900 min-w-0">
          {leftPanelView === "add-features" ? (
            /* Star icon: New Chat + scrollable content, prompt input niche (bottom) with sab isme */
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              <div className="shrink-0 border-b border-gray-700 px-2 py-2">
                <button
                  type="button"
                  onClick={startNewChat}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${activeChatId === null ? "bg-brand-500/25 text-brand-300" : "text-gray-300 hover:bg-gray-800 hover:text-white"}`}
                >
                  New Chat
                </button>
              </div>
              {/* Scrollable: active chat messages, Add Features, Past Chats */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 custom-scrollbar-panel">
                {activeChatId && (chatMessages[activeChatId]?.length ?? 0) > 0 && (
                  <div className="space-y-2 border-b border-gray-700 pb-3">
                    {(chatMessages[activeChatId] ?? []).map((msg, i) => (
                      <div key={i} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${msg.role === "user" ? "bg-brand-500/30 text-brand-200" : "bg-gray-700 text-gray-200"}`}>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="thinking-bubble flex max-w-[90%] items-center gap-3 rounded-xl border border-gray-600/50 bg-gray-700/95 px-4 py-3 shadow-sm backdrop-blur-sm">
                          <div className="flex gap-1.5" aria-hidden>
                            <span className="thinking-dot h-2 w-2 rounded-full bg-brand-400" />
                            <span className="thinking-dot h-2 w-2 rounded-full bg-brand-400" />
                            <span className="thinking-dot h-2 w-2 rounded-full bg-brand-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-200">
                            {autoApi === "chatgpt" ? "ChatGPT" : autoApi === "grok" ? "Grok" : "Gemini"} is thinking
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Add Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {WEBSITE_PROMPTS.map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedPromptId(selectedPromptId === id ? null : id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedPromptId === id ? "bg-brand-500/30 text-brand-300 ring-1 ring-brand-500/50" : "bg-gray-700/80 text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {pastChats.length > 0 && (
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Past Chats</span>
                      <button type="button" className="text-xs text-brand-400 hover:underline">View All</button>
                    </div>
                    <ul className="space-y-0.5">
                      {pastChats.slice(0, 8).map((chat) => (
                        <li key={chat.id}>
                          <button
                            type="button"
                            onClick={() => setActiveChatId(chat.id)}
                            className={`w-full rounded px-2 py-1.5 text-left text-xs ${activeChatId === chat.id ? "bg-gray-700 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
                          >
                            <span className="block truncate">{chat.title}</span>
                            <span className="text-[10px] text-gray-500">
                              {(() => {
                                const diff = Date.now() - chat.createdAt;
                                if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
                                if (diff < 3600_000) return `${Math.round(diff / 60000)}m ago`;
                                if (diff < 86400_000) return `${Math.round(diff / 3600000)}h ago`;
                                return `${Math.round(diff / 86400_000)}d ago`;
                              })()}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Niche: prompt input – sab isme (Review, textarea, ∞ Agent, Auto, refresh, image, mic) */}
              <div className="shrink-0 border-t border-gray-700 p-3 bg-gray-900">
                <div className="rounded-xl border border-[#6b7cbd]/50 bg-[#22252c] overflow-hidden shadow-inner">
                  <label className="sr-only" htmlFor="prompt-input">Prompt</label>
                  <textarea
                    id="prompt-input"
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitPrompt(); } }}
                    placeholder=""
                    rows={2}
                    className="w-full resize-none border-0 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-0"
                  />
                    <div className="flex items-center justify-between gap-2 border-t border-gray-700/50 px-2 py-2">
                      <div className="flex items-center gap-1.5">
                        <select
                        value={autoApi}
                        onChange={(e) => setAutoApi(e.target.value as "gemini" | "chatgpt" | "grok" | "none")}
                        className="rounded-md border-0 bg-gray-700/80 px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-brand-500"
                        aria-label="Auto"
                      >
                        <option value="gemini">Gemini</option>
                        <option value="chatgpt">ChatGPT</option>
                        <option value="grok">Grok</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Refresh" aria-label="Refresh"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                      <button type="button" className="rounded-full p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white" title="Attach image" aria-label="Attach image"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" /></svg></button>
                      <button type="button" className="rounded-full p-1.5 bg-gray-700 text-white hover:bg-gray-600" title="Voice input" aria-label="Voice input"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v3m0 0v-3m0 0a7 7 0 017-7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19v2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v-4" /></svg></button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={submitPrompt}
                  disabled={!promptInput.trim() || chatLoading}
                  className="mt-2 w-full rounded-lg bg-brand-500 py-2 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {chatLoading ? "Sending…" : "Send prompt → New chat"}
                </button>
              </div>
            </div>
          ) : (
            /* Baaki time: Navigator */
            <>
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
              <div className="flex-1 overflow-y-auto overflow-x-visible p-2 custom-scrollbar-panel">
                <NavigatorTree
              nodes={navTree}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onReorder={reorderChildren}
              getNodeLabel={getNodeLabel}
              onRename={handleRename}
                />
              </div>
            </>
          )}
        </div>
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex-1 overflow-auto bg-gray-800/30 p-6 custom-scrollbar-panel">
            <div
              className="mx-auto min-h-full rounded-lg border border-gray-600 bg-white shadow-xl"
              style={{ maxWidth: viewportPx }}
              data-viewport={viewportCategory}
            >
              <div
                className={
                  viewportCategory === "mobile"
                    ? "p-4"
                    : viewportCategory === "tablet"
                      ? "p-6"
                      : "p-6 md:p-10"
                }
              >
                {/* Navigation - desktop: row; mobile/tablet: hamburger menu */}
                <nav
                  data-id="navigation"
                  onClick={(e) => { e.stopPropagation(); onSelect("navigation"); }}
                  style={getElementStyle("navigation")}
                  className={`relative flex border-b-2 border-brand-500 pb-3 ${viewportCategory === "desktop" ? "items-center justify-between" : "flex-col gap-0"} ${selectedId === "navigation" ? "ring-2 ring-brand-500 ring-offset-2 -m-1 p-1 rounded" : ""}`}
                >
                  <div className="flex w-full items-center justify-between">
                    <h1
                      className={
                        viewportCategory === "mobile"
                          ? "text-lg font-bold text-gray-900 underline decoration-brand-500 decoration-2 underline-offset-2"
                          : "text-2xl font-bold text-gray-900 underline decoration-brand-500 decoration-2 underline-offset-2"
                      }
                    >
                      {content.title || "Portfolio"}
                    </h1>
                    {viewportCategory !== "desktop" && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setNavMenuOpen((o) => !o); }}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        aria-label={navMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={navMenuOpen}
                      >
                        <span className="flex h-5 w-5 flex-col justify-center gap-1" aria-hidden>
                          <span className={`h-0.5 w-5 rounded-full bg-current transition ${navMenuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                          <span className={`h-0.5 w-5 rounded-full bg-current transition ${navMenuOpen ? "opacity-0" : ""}`} />
                          <span className={`h-0.5 w-5 rounded-full bg-current transition ${navMenuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
                        </span>
                      </button>
                    )}
                  </div>
                  {viewportCategory === "desktop" ? (
                    <div className="flex gap-6 text-sm font-medium uppercase tracking-wide text-gray-700">
                      <a href="#home" className="hover:text-brand-500">HOME</a>
                      <a href="#about" className="hover:text-brand-500">ABOUT</a>
                      <a href="#styleguide" className="hover:text-brand-500">STYLEGUIDE</a>
                    </div>
                  ) : (
                    <div
                      className={`overflow-hidden transition-all duration-200 ease-out ${navMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="flex flex-col gap-1 border-t border-gray-200 pt-3">
                        <a href="#home" className="py-2 text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-brand-500">HOME</a>
                        <a href="#about" className="py-2 text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-brand-500">ABOUT</a>
                        <a href="#styleguide" className="py-2 text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-brand-500">STYLEGUIDE</a>
                      </div>
                    </div>
                  )}
                </nav>
                {/* Hero / Intro - responsive margins & text */}
                <section
                  data-id="hero"
                  onClick={(e) => { e.stopPropagation(); onSelect("hero"); }}
                  style={getElementStyle("hero")}
                  className={`relative rounded-lg p-4 ${viewportCategory === "mobile" ? "mt-6" : "mt-10"} ${selectedId === "hero" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  {selectedId === "hero" && (
                    <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Section</span>
                  )}
                  <div className="border-b border-brand-500 pb-2 mb-6 flex items-center justify-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-brand-500/60" aria-hidden />
                  </div>
                  <label className="text-xs font-medium text-brand-600" data-id="name-text" style={getElementStyle("name-text")} onClick={(e) => { e.stopPropagation(); onSelect("name-text"); }}>T Name Text</label>
                  <input
                    type="text"
                    value={content.heroHeading || "Jane Lo"}
                    onChange={(e) => onUpdateContent("heroHeading", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`mt-1 block w-full max-w-md rounded border border-brand-500/50 bg-white px-3 py-2 font-semibold text-gray-900 ${viewportCategory === "mobile" ? "text-base" : "text-xl"}`}
                  />
                  <p className="mt-2 text-sm text-gray-500" data-id="paragraph-intro" style={getElementStyle("paragraph-intro")} onClick={(e) => { e.stopPropagation(); onSelect("paragraph-intro"); }}>{content.heroDescription || "Product Designer"}</p>
                  <p
                    className={`mt-6 font-medium leading-tight text-black ${viewportCategory === "mobile" ? "text-xl" : viewportCategory === "tablet" ? "text-2xl" : "text-3xl md:text-4xl"}`}
                    data-id="heading-jumbo"
                    style={getElementStyle("heading-jumbo")}
                    onClick={(e) => { e.stopPropagation(); onSelect("heading-jumbo"); }}
                  >
                    {content.heroJumboText || "Hey there! I'm a creative graphic and web designer based in sunny San Francisco, CA."}
                  </p>
                </section>
                {/* Works Grid - responsive cols & gap */}
                <section
                  data-id="works-section"
                  onClick={(e) => { e.stopPropagation(); onSelect("works-section"); }}
                  style={getElementStyle("works-section")}
                  className={`relative rounded-lg p-4 ${viewportCategory === "mobile" ? "mt-8" : "mt-16"} ${selectedId === "works-section" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  <div
                    className={`grid ${viewportCategory === "mobile" ? "grid-cols-1 gap-4" : viewportCategory === "tablet" ? "grid-cols-1 sm:grid-cols-2 gap-6" : "grid-cols-1 sm:grid-cols-2 gap-8"}`}
                    data-id="works-grid"
                    style={getElementStyle("works-grid")}
                    onClick={(e) => { e.stopPropagation(); onSelect("works-grid"); }}
                  >
                    {[
                      { id: "div-block-1", title: getCanvasCopy(content, "work1Title", "Project 1"), category: getCanvasCopy(content, "work1Category", "Graphic Design") },
                      { id: "div-block-2", title: getCanvasCopy(content, "work2Title", "Project 2"), category: getCanvasCopy(content, "work2Category", "Web Design") },
                      { id: "div-block-3", title: getCanvasCopy(content, "work3Title", "Project 3"), category: getCanvasCopy(content, "work3Category", "Web Design") },
                      { id: "div-block-4", title: getCanvasCopy(content, "work4Title", "Project 4"), category: getCanvasCopy(content, "work4Category", "Graphic Design") },
                    ].map(({ id, title, category }) => (
                      <div
                        key={id}
                        data-id={id}
                        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                        style={getElementStyle(id)}
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
                {/* My experience - responsive margins & grid */}
                <section
                  data-id="work-experience-grid"
                  onClick={(e) => { e.stopPropagation(); onSelect("work-experience-grid"); }}
                  style={getElementStyle("work-experience-grid")}
                  className={`relative rounded-lg p-4 ${viewportCategory === "mobile" ? "mt-8" : "mt-16"} ${["work-experience-grid", "experience-container", "career-headline-wrap", "heading-experience", "paragraph-experience"].includes(selectedId ?? "") || selectedId?.startsWith("work-position") ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  <h2 className={`font-bold text-gray-900 mb-4 ${viewportCategory === "mobile" ? "text-xl" : "text-2xl"}`} data-id="heading-experience" style={getElementStyle("heading-experience")} onClick={(e) => { e.stopPropagation(); onSelect("heading-experience"); }}>{getCanvasCopy(content, "experienceHeading", "My experience")}</h2>
                  <p className={`text-gray-600 max-w-2xl ${viewportCategory === "mobile" ? "mb-6 text-sm" : "mb-8"}`} data-id="paragraph-experience" style={getElementStyle("paragraph-experience")} onClick={(e) => { e.stopPropagation(); onSelect("paragraph-experience"); }}>
                    {getCanvasCopy(content, "experienceParagraph", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.")}
                  </p>
                  <div
                    className={`grid gap-4 ${viewportCategory === "mobile" ? "grid-cols-1" : viewportCategory === "tablet" ? "grid-cols-1 sm:grid-cols-2 gap-6" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}`}
                    data-id="experience-container"
                    style={getElementStyle("experience-container")}
                    onClick={(e) => { e.stopPropagation(); onSelect("experience-container"); }}
                  >
                    {[
                      { company: getCanvasCopy(content, "exp1Company", "Webflow"), role: getCanvasCopy(content, "exp1Role", "Graphic Designer"), period: getCanvasCopy(content, "exp1Period", "April 2014 — Mar 2015") },
                      { company: getCanvasCopy(content, "exp2Company", "Webflow"), role: getCanvasCopy(content, "exp2Role", "Web Designer"), period: getCanvasCopy(content, "exp2Period", "Apr 2015 — Mar 2016") },
                      { company: getCanvasCopy(content, "exp3Company", "Webflow"), role: getCanvasCopy(content, "exp3Role", "Visual Developer"), period: getCanvasCopy(content, "exp3Period", "Jun 2016 — Jul 2017") },
                      { company: getCanvasCopy(content, "exp4Company", "Webflow"), role: getCanvasCopy(content, "exp4Role", "Dictator"), period: getCanvasCopy(content, "exp4Period", "Aug 2017 — forever") },
                    ].map((item, i) => (
                      <div key={i} data-id={`work-position-${i + 1}`} onClick={(e) => { e.stopPropagation(); onSelect(`work-position-${i + 1}`); }} style={getElementStyle(`work-position-${i + 1}`)} className="rounded border border-gray-200 p-4">
                        <p className="font-semibold text-gray-800">{item.company}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.role}</p>
                        <p className="text-sm text-gray-500 mt-1">{item.period}</p>
                      </div>
                    ))}
                  </div>
                </section>
                {/* Section New - Works Grid with Div Blocks (no intro) */}
                <section
                  data-id="section-new"
                  onClick={(e) => { e.stopPropagation(); onSelect("section-new"); }}
                  style={getElementStyle("section-new")}
                  className={`relative rounded-lg p-4 ${viewportCategory === "mobile" ? "mt-8" : "mt-16"} ${selectedId === "section-new" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  {selectedId === "section-new" && (
                    <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Section</span>
                  )}
                  <div
                    data-id="section-new-grid"
                    onClick={(e) => { e.stopPropagation(); onSelect("section-new-grid"); }}
                    style={getElementStyle("section-new-grid")}
                    className={`grid ${viewportCategory === "mobile" ? "grid-cols-1 gap-4" : viewportCategory === "tablet" ? "grid-cols-1 sm:grid-cols-2 gap-6" : "grid-cols-1 sm:grid-cols-2 gap-8"} ${selectedId === "section-new-grid" ? "ring-2 ring-brand-500 ring-offset-2 rounded-lg" : ""}`}
                  >
                    {[
                      { id: "section-new-div-1", title: getCanvasCopy(content, "sectionNew1Title", "Card 1"), category: getCanvasCopy(content, "sectionNew1Category", "Category") },
                      { id: "section-new-div-2", title: getCanvasCopy(content, "sectionNew2Title", "Card 2"), category: getCanvasCopy(content, "sectionNew2Category", "Category") },
                      { id: "section-new-div-3", title: getCanvasCopy(content, "sectionNew3Title", "Card 3"), category: getCanvasCopy(content, "sectionNew3Category", "Category") },
                      { id: "section-new-div-4", title: getCanvasCopy(content, "sectionNew4Title", "Card 4"), category: getCanvasCopy(content, "sectionNew4Category", "Category") },
                    ].map(({ id, title, category }) => (
                      <div
                        key={id}
                        data-id={id}
                        onClick={(e) => { e.stopPropagation(); onSelect(id); }}
                        style={getElementStyle(id)}
                        className={`rounded-lg border border-gray-200 overflow-hidden ${selectedId === id ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                      >
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-brand-600 font-medium">Image</span>
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                          <p className="text-sm text-gray-500">{category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                {/* Contact */}
                <section
                  data-id="contact"
                  onClick={(e) => { e.stopPropagation(); onSelect("contact"); }}
                  style={getElementStyle("contact")}
                  className={`relative mt-16 rounded-lg overflow-hidden ${selectedId === "contact" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 px-6 py-12 md:px-10 md:py-16">
                    {selectedId === "contact" && (
                      <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Contact</span>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900">{getCanvasCopy(content, "contactHeading", "Want to get in touch?")}</h2>
                    <h3 className="text-2xl font-semibold text-gray-800 mt-1">{getCanvasCopy(content, "contactSubheading", "Drop me a line!")}</h3>
                    <p className="mt-4 text-gray-600 max-w-xl">{getCanvasCopy(content, "contactParagraph", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.")}</p>
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
                  style={getElementStyle("footer")}
                  className={`relative mt-0 border-t border-gray-200 bg-white py-6 ${selectedId === "footer" ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                >
                  {selectedId === "footer" && (
                    <span className="absolute left-0 top-0 z-10 rounded-br bg-brand-500 px-2 py-0.5 text-xs font-medium text-white">Footer</span>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-xs font-bold text-white">W</span>
                    <span>{getCanvasCopy(content, "footerText", "POWERED BY WEBFLOW")}</span>
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
                  <ul className="max-h-64 overflow-y-auto py-1 custom-scrollbar-panel">
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
                          <ChevronLeftIcon className="h-5 w-5 shrink-0 rotate-180 text-gray-500" aria-hidden />
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
          <div className="flex-1 overflow-y-auto p-4 text-gray-300 custom-scrollbar-panel">
            {propertiesTab === "Style" && (
              <div className="space-y-1">
                {!selectedId ? (
                  <p className="text-center text-sm text-gray-500 py-4">Select an element on the canvas to edit its style.</p>
                ) : (
                  (() => {
                    const sid = selectedId;
                    const s = elementStyles[sid] ?? {};
                    const upd = (partial: Partial<ElementStyle>) => updateElementStyle(sid, partial);
                    const sec = (key: string, title: string, children: React.ReactNode) => (
                      <div key={key} className="rounded-lg border border-gray-700 bg-gray-800/50 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleStyleSection(key)}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold text-white hover:bg-gray-700/50"
                        >
                          {title}
                          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${styleSectionsExpanded[key] !== false ? "rotate-0" : "-rotate-90"}`} />
                        </button>
                        {styleSectionsExpanded[key] !== false && <div className="border-t border-gray-700 px-3 py-2.5 space-y-3">{children}</div>}
                      </div>
                    );
                    const inputClass = "w-full rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-sm text-white focus:border-brand-500 focus:outline-none";
                    const labelClass = "block text-xs font-medium text-gray-400 mb-1";
                    return (
                      <>
                        <p className="text-xs text-gray-400 mb-3">Editing <strong className="text-white">{selectedLabel}</strong></p>
                        {sec("Layout", "Layout",
                          <div className="space-y-2">
                            <span className={labelClass}>Display</span>
                            <div className="flex flex-wrap gap-1">
                              {(["block", "flex", "grid", "none"] as const).map((d) => (
                                <button key={d} type="button" onClick={() => upd({ display: d })} className={`rounded px-2.5 py-1.5 text-xs font-medium capitalize ${(s.display ?? "block") === d ? "bg-brand-500/30 text-brand-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>{d}</button>
                              ))}
                            </div>
                          </div>
                        )}
                        {sec("Spacing", "Spacing",
                          <div className="space-y-4 overflow-visible">
                            <div className="flex items-center justify-end">
                              <button type="button" title="Link spacing values" className="rounded p-1.5 text-gray-400 hover:bg-gray-700 hover:text-white shrink-0">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1" aria-hidden><rect x="3" y="3" width="14" height="14" rx="1" /><rect x="6" y="6" width="8" height="8" rx="0.5" strokeDasharray="1.5 1" /></svg>
                              </button>
                            </div>
                            {/* Clear grid layout: no overlap, no clipping */}
                            <div className="rounded-lg border border-gray-600 bg-gray-900/80 p-4 space-y-4 overflow-visible">
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Margin</p>
                                <div className="grid grid-cols-4 gap-2">
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">T</label><input type="text" placeholder="0" value={s.marginTop ?? ""} onChange={(e) => upd({ marginTop: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">R</label><input type="text" placeholder="0" value={s.marginRight ?? ""} onChange={(e) => upd({ marginRight: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">B</label><input type="text" placeholder="0" value={s.marginBottom ?? ""} onChange={(e) => upd({ marginBottom: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">L</label><input type="text" placeholder="0" value={s.marginLeft ?? ""} onChange={(e) => upd({ marginLeft: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-2">
                                  <button type="button" onClick={() => upd({ marginLeft: s.marginLeft === "auto" ? "" : "auto" })} className={`flex-1 min-w-0 py-2 rounded text-xs font-medium ${s.marginLeft === "auto" ? "bg-brand-500/30 text-brand-300" : "bg-gray-700 text-brand-400 hover:bg-gray-600"}`}>Auto L</button>
                                  <button type="button" onClick={() => upd({ marginRight: s.marginRight === "auto" ? "" : "auto" })} className={`flex-1 min-w-0 py-2 rounded text-xs font-medium ${s.marginRight === "auto" ? "bg-brand-500/30 text-brand-300" : "bg-gray-700 text-brand-400 hover:bg-gray-600"}`}>Auto R</button>
                                </div>
                              </div>
                              <div className="border-t border-gray-600 pt-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Padding</p>
                                <div className="grid grid-cols-4 gap-2">
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">T</label><input type="text" placeholder="0" value={s.paddingTop ?? ""} onChange={(e) => upd({ paddingTop: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">R</label><input type="text" placeholder="0" value={s.paddingRight ?? ""} onChange={(e) => upd({ paddingRight: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">B</label><input type="text" placeholder="0" value={s.paddingBottom ?? ""} onChange={(e) => upd({ paddingBottom: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                  <div><label className="block text-[10px] text-gray-500 mb-0.5">L</label><input type="text" placeholder="0" value={s.paddingLeft ?? ""} onChange={(e) => upd({ paddingLeft: e.target.value || undefined })} className={`w-full ${inputClass} text-center text-xs py-2`} /></div>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-snug">Centering doesn&apos;t affect elements without a fixed width.</p>
                          </div>
                        )}
                        {sec("Size", "Size",
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className={labelClass}>Width</label><input type="text" placeholder="Auto" value={s.width ?? ""} onChange={(e) => upd({ width: e.target.value || undefined })} className={inputClass} /></div>
                              <div><label className={labelClass}>Height</label><input type="text" placeholder="Auto" value={s.height ?? ""} onChange={(e) => upd({ height: e.target.value || undefined })} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className={labelClass}>Min W</label><input type="text" placeholder="0" value={s.minWidth ?? ""} onChange={(e) => upd({ minWidth: e.target.value || undefined })} className={inputClass} /></div>
                              <div><label className={labelClass}>Min H</label><input type="text" placeholder="0" value={s.minHeight ?? ""} onChange={(e) => upd({ minHeight: e.target.value || undefined })} className={inputClass} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className={labelClass}>Max W</label><input type="text" placeholder="None" value={s.maxWidth ?? ""} onChange={(e) => upd({ maxWidth: e.target.value || undefined })} className={inputClass} /></div>
                              <div><label className={labelClass}>Max H</label><input type="text" placeholder="None" value={s.maxHeight ?? ""} onChange={(e) => upd({ maxHeight: e.target.value || undefined })} className={inputClass} /></div>
                            </div>
                            <div>
                              <span className={labelClass}>Overflow</span>
                              <div className="flex flex-wrap gap-1">
                                {(["visible", "hidden", "scroll", "auto"] as const).map((o) => (
                                  <button key={o} type="button" onClick={() => upd({ overflow: o })} className={`rounded px-2 py-1 text-xs ${(s.overflow ?? "visible") === o ? "bg-brand-500/30 text-brand-300" : "bg-gray-700 text-gray-400 hover:bg-gray-600"}`}>{o}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {sec("Position", "Position",
                          <div>
                            <span className={labelClass}>Position</span>
                            <select value={s.position ?? "static"} onChange={(e) => upd({ position: e.target.value as ElementStyle["position"] })} className={inputClass}>
                              {(["static", "relative", "absolute", "fixed", "sticky"] as const).map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                        )}
                        {sec("Typography", "Typography",
                          <div className="space-y-2">
                            <div><label className={labelClass}>Font</label><input type="text" placeholder="inherit" value={s.fontFamily ?? ""} onChange={(e) => upd({ fontFamily: e.target.value || undefined })} className={inputClass} /></div>
                            <div><label className={labelClass}>Weight</label><select value={String(s.fontWeight ?? "")} onChange={(e) => upd({ fontWeight: e.target.value ? (e.target.value === "bold" ? "bold" : Number(e.target.value)) : undefined })} className={inputClass}><option value="">Default</option><option value="300">300</option><option value="400">400 - Normal</option><option value="500">500</option><option value="600">600</option><option value="700">700 - Bold</option><option value="bold">Bold</option></select></div>
                            <div className="grid grid-cols-2 gap-2">
                              <div><label className={labelClass}>Size</label><input type="text" placeholder="inherit" value={s.fontSize ?? ""} onChange={(e) => upd({ fontSize: e.target.value || undefined })} className={inputClass} /></div>
                              <div><label className={labelClass}>Line height</label><input type="text" placeholder="inherit" value={s.lineHeight ?? ""} onChange={(e) => upd({ lineHeight: e.target.value || undefined })} className={inputClass} /></div>
                            </div>
                            <div><label className={labelClass}>Color</label><div className="flex gap-2"><input type="color" value={s.color?.startsWith("#") ? s.color : "#000000"} onChange={(e) => upd({ color: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-gray-600 bg-gray-800 p-0" /><input type="text" placeholder="#000" value={s.color ?? ""} onChange={(e) => upd({ color: e.target.value || undefined })} className={`${inputClass} flex-1`} /></div></div>
                            <div><span className={labelClass}>Align</span><div className="flex gap-1">{(["left", "center", "right", "justify"] as const).map((a) => <button key={a} type="button" onClick={() => upd({ textAlign: a })} className={`rounded p-1.5 text-xs ${(s.textAlign ?? "left") === a ? "bg-brand-500/30 text-brand-300" : "bg-gray-700 text-gray-400"}`} title={a}>{a.slice(0, 1).toUpperCase()}</button>)}</div></div>
                            <div><span className={labelClass}>Decoration</span><div className="flex gap-1">{(["none", "underline", "line-through", "overline"] as const).map((d) => <button key={d} type="button" onClick={() => upd({ textDecoration: d })} className={`rounded px-2 py-1 text-xs ${(s.textDecoration ?? "none") === d ? "bg-brand-500/30 text-brand-300" : "bg-gray-700 text-gray-400"}`}>{d === "none" ? "None" : d}</button>)}</div></div>
                          </div>
                        )}
                        {sec("Backgrounds", "Backgrounds",
                          <div>
                            <label className={labelClass}>Color</label>
                            <div className="flex gap-2"><input type="color" value={s.backgroundColor?.startsWith("#") ? s.backgroundColor : "#ffffff"} onChange={(e) => upd({ backgroundColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-gray-600 bg-gray-800 p-0" /><input type="text" placeholder="transparent" value={s.backgroundColor ?? ""} onChange={(e) => upd({ backgroundColor: e.target.value || undefined })} className={`${inputClass} flex-1`} /></div>
                          </div>
                        )}
                        {sec("Borders", "Borders",
                          <div className="space-y-2">
                            <div><label className={labelClass}>Radius</label><input type="text" placeholder="0" value={s.borderRadius ?? ""} onChange={(e) => upd({ borderRadius: e.target.value || undefined })} className={inputClass} /></div>
                            <div><label className={labelClass}>Width</label><input type="text" placeholder="0" value={s.borderWidth ?? ""} onChange={(e) => upd({ borderWidth: e.target.value || undefined })} className={inputClass} /></div>
                            <div><label className={labelClass}>Style</label><select value={s.borderStyle ?? "none"} onChange={(e) => upd({ borderStyle: e.target.value as ElementStyle["borderStyle"] })} className={inputClass}><option value="none">None</option><option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="double">Double</option></select></div>
                            <div><label className={labelClass}>Color</label><div className="flex gap-2"><input type="color" value={s.borderColor?.startsWith("#") ? s.borderColor : "#000000"} onChange={(e) => upd({ borderColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-gray-600 bg-gray-800 p-0" /><input type="text" value={s.borderColor ?? ""} onChange={(e) => upd({ borderColor: e.target.value || undefined })} className={`${inputClass} flex-1`} /></div></div>
                          </div>
                        )}
                        {sec("Effects", "Effects",
                          <div className="space-y-2">
                            <div><label className={labelClass}>Opacity (%)</label><input type="number" min={0} max={100} value={s.opacity != null ? Math.round(s.opacity * 100) : ""} onChange={(e) => { const v = e.target.value; upd({ opacity: v === "" ? undefined : Number(v) / 100 }); }} className={inputClass} placeholder="100" /></div>
                            <div><label className={labelClass}>Blending</label><select value={s.mixBlendMode ?? "normal"} onChange={(e) => upd({ mixBlendMode: e.target.value || undefined })} className={inputClass}><option value="normal">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="darken">Darken</option><option value="lighten">Lighten</option></select></div>
                            <div><label className={labelClass}>Cursor</label><select value={s.cursor ?? "auto"} onChange={(e) => upd({ cursor: e.target.value || undefined })} className={inputClass}><option value="auto">Auto</option><option value="pointer">Pointer</option><option value="default">Default</option><option value="text">Text</option><option value="not-allowed">Not allowed</option></select></div>
                          </div>
                        )}
                      </>
                    );
                  })()
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
                    <label className="block text-xs font-medium text-gray-400">Intro / Jumbo text</label>
                    <textarea
                      value={content.heroJumboText ?? ""}
                      onChange={(e) => onUpdateContent("heroJumboText", e.target.value)}
                      placeholder="Hey there! I'm a creative graphic and web designer..."
                      rows={2}
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

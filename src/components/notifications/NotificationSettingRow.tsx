"use client";

import React from "react";

interface NotificationSettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  variant?: "solid" | "blur";
}

const NotificationSettingRow: React.FC<NotificationSettingRowProps> = ({
  title,
  description,
  checked,
  onChange,
  required = false,
  disabled = false,
  variant = "solid",
}) => {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-gray-200 last:border-b-0 dark:border-gray-800">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {title}
          </span>
          {required && (
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              REQUIRED
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm font-normal text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={`relative shrink-0 h-6 w-11 rounded-full transition-all duration-150 ${
          variant === "blur"
            ? disabled
              ? checked
                ? "cursor-not-allowed pointer-events-none bg-[#8DAFFF]/90 shadow-[0_0_12px_rgba(141,175,255,0.4)] dark:bg-[#8DAFFF]/80"
                : "cursor-not-allowed bg-gray-100 dark:bg-gray-800"
              : checked
              ? "bg-[#8DAFFF]/90 shadow-[0_0_12px_rgba(141,175,255,0.4)] dark:bg-[#8DAFFF]/80"
              : "bg-gray-200 dark:bg-white/10"
            : disabled
            ? checked
              ? "cursor-not-allowed pointer-events-none bg-brand-500 dark:bg-brand-500"
              : "cursor-not-allowed bg-gray-100 dark:bg-gray-800"
            : checked
            ? "bg-brand-500 dark:bg-brand-500"
            : "bg-gray-200 dark:bg-white/10"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full transition-transform duration-150 ease-linear ${
            variant === "blur"
              ? "bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.15),0_0_4px_rgba(255,255,255,0.8)] backdrop-blur-sm"
              : "bg-white shadow-sm"
          } ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
};

export default NotificationSettingRow;

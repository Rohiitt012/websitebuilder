"use client";

import React, { useState, useEffect } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import NotificationSettingRow from "@/components/notifications/NotificationSettingRow";
import { BellIcon } from "@/icons";

export type NotificationSettings = {
  emailNotifications: boolean;
  productUpdates: boolean;
  offersPromotions: boolean;
  newsTips: boolean;
};

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  productUpdates: true,
  offersPromotions: true,
  newsTips: true,
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "settings">(
    "settings"
  );
  const [settings, setSettings] =
    useState<NotificationSettings>(defaultSettings);
  const [notifications] = useState<NotificationItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/notifications/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...defaultSettings, ...prev, ...data }));
        } else if (res.status === 401) {
          setSettings(defaultSettings);
        } else {
          setError("Failed to load settings");
        }
      } catch {
        setError("Failed to load settings");
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/notifications/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setHasChanges(false);
      } else {
        setError("Failed to save settings");
      }
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "all" as const, label: "All" },
    { id: "unread" as const, label: `Unread (${unreadCount})` },
    { id: "settings" as const, label: "Settings" },
  ];

  return (
    <div>
      <PageBreadCrumb pageTitle="Notifications" />
      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-100 px-4 py-2.5 dark:bg-indigo-950/40">
            <BellIcon className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span className="text-base font-semibold text-indigo-600 dark:text-indigo-400">
              Notifications
            </span>
          </div>
          <p className="mt-3 text-sm font-normal text-gray-600 dark:text-gray-400">
            {unreadCount} unread notifications
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
          <nav className="-mb-px flex gap-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-500 font-bold text-brand-500"
                    : "border-transparent font-normal text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "all" && (
          <div className="py-8 text-center">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <BellIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ul className="space-y-3 text-left">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-lg border p-4 ${
                      n.read
                        ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-transparent"
                        : "border-brand-200 bg-brand-25 dark:border-brand-800 dark:bg-brand-950/30"
                    }`}
                  >
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {n.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {n.message}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{n.time}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "unread" && (
          <div className="py-8 text-center">
            {unreadCount === 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <BellIcon className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No unread notifications
                </p>
              </div>
            ) : (
              <ul className="space-y-3 text-left">
                {notifications
                  .filter((n) => !n.read)
                  .map((n) => (
                    <li
                      key={n.id}
                      className="rounded-lg border border-brand-200 bg-brand-25 p-4 dark:border-brand-800 dark:bg-brand-950/30"
                    >
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {n.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {n.message}
                      </p>
                      <p className="mt-2 text-xs text-gray-400">{n.time}</p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8">
            {error && (
              <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600 dark:border-error-800 dark:bg-error-950/30 dark:text-error-400">
                {error}
              </div>
            )}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              </div>
            ) : (
          <>
            {/* Activity & Marketing */}
            <section>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                Activity & Marketing
              </h4>
              <p className="mt-1 mb-4 text-sm font-normal text-gray-600 dark:text-gray-400">
                Choose which additional updates and offers you want to receive.
              </p>
              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900/50">
                <NotificationSettingRow
                  title="Email Notifications"
                  description="Receive general notifications via email."
                  checked={settings.emailNotifications}
                  onChange={(v) => updateSetting("emailNotifications", v)}
                />
                <NotificationSettingRow
                  title="Product Updates"
                  description="Stay informed about new features and improvements."
                  checked={settings.productUpdates}
                  onChange={(v) => updateSetting("productUpdates", v)}
                />
                <NotificationSettingRow
                  title="Offers & Promotions"
                  description="Receive special deals and promotional content."
                  checked={settings.offersPromotions}
                  onChange={(v) => updateSetting("offersPromotions", v)}
                />
                <NotificationSettingRow
                  title="News & Tips"
                  description="Get helpful advice and the latest Industry news."
                  checked={settings.newsTips}
                  onChange={(v) => updateSetting("newsTips", v)}
                />
              </div>
            </section>

            {/* System Notifications (Mandatory) */}
            <section>
              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                System Notifications (Mandatory)
              </h4>
              <p className="mt-1 mb-4 text-sm font-normal text-gray-600 dark:text-gray-400">
                These essential alerts keep you informed about your account and
                post status.
              </p>
              <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900/50">
                <NotificationSettingRow
                  title="Post Published"
                  description="Get notified when a post is successfully published."
                  checked={true}
                  onChange={() => {}}
                  required
                  disabled
                  variant="blur"
                />
                <NotificationSettingRow
                  title="Post Approved"
                  description="Receive an alert when your post is approved."
                  checked={true}
                  onChange={() => {}}
                  required
                  disabled
                  variant="blur"
                />
                <NotificationSettingRow
                  title="User Invited"
                  description="Get notified when a new user is invited to your company."
                  checked={true}
                  onChange={() => {}}
                  required
                  disabled
                  variant="blur"
                />
                <NotificationSettingRow
                  title="Subscription Expiring"
                  description="Receive warnings before your subscription ends."
                  checked={true}
                  onChange={() => {}}
                  required
                  disabled
                  variant="blur"
                />
                <NotificationSettingRow
                  title="Report Generated"
                  description="Get notified when a scheduled report is ready."
                  checked={true}
                  onChange={() => {}}
                  required
                  disabled
                  variant="blur"
                />
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

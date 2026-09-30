import type { Metadata } from "next";
import * as admin from "@/app/admin/actions";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { requireAdmin } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { toastConnection } from "@/server/toast";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <SettingsView
      settings={settings}
      toast={toastConnection()}
      actions={{
        saveOrdering: admin.saveOrderingAction,
        saveHours: admin.saveHoursAction,
        saveAnnouncement: admin.saveAnnouncementAction,
        saveToast: admin.saveToastAction,
      }}
    />
  );
}

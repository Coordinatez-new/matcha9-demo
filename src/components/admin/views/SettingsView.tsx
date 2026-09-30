import {
  AnnouncementForm,
  HoursForm,
  OrderingForm,
  ToastForm,
} from "@/components/admin/SettingsForms";
import type { SettingsActions, ToastInfo } from "@/components/admin/types";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import { hoursLine, type Settings } from "@/lib/settings";

const toastVariables = [
  "TOAST_CLIENT_ID",
  "TOAST_CLIENT_SECRET",
  "TOAST_RESTAURANT_GUID",
  "TOAST_TAKEOUT_DINING_OPTION_GUID",
  "TOAST_MENU_GROUP_GUID",
];

/** How ordering works, opening hours, the announcement bar and Toast. */
export function SettingsView({
  settings,
  toast,
  actions,
}: {
  settings: Settings;
  toast: ToastInfo;
  actions: SettingsActions;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Store settings"
        description="How online ordering works, when you’re open, and the bar across the top of the website."
      />
      <div className="mt-8 space-y-6">
        <Card
          title="Online ordering"
          description="Pickup times are offered in Chicago time, within your opening hours."
        >
          <OrderingForm value={settings.ordering} save={actions.saveOrdering} />
        </Card>

        <Card
          title="Opening hours"
          description={`Shown on the website as “${hoursLine(settings.store.hours)}”.`}
        >
          <HoursForm value={settings.store} save={actions.saveHours} />
        </Card>

        <Card title="Announcement bar" description="The thin line of news above the header.">
          <AnnouncementForm value={settings.announcement} save={actions.saveAnnouncement} />
        </Card>

        <Card title="Toast" description="Your point of sale and delivery partner.">
          <ToastForm value={settings.toast} save={actions.saveToast} />
          <div className="mt-6 rounded-lg border border-line bg-cream/60 p-5 text-sm leading-relaxed">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-ink">POS connection</span>
              {toast.live ? (
                <Badge tone="green">Connected · {toast.host}</Badge>
              ) : (
                <Badge tone="amber">Not connected · demo mode</Badge>
              )}
            </div>
            <p className="mt-3 text-ink-soft">
              To send every website order straight into Toast, Toast API access (an integration with
              order-write access) is set up on the server, not here, so the keys stay secret. Your
              developer adds these environment variables:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {toastVariables.map((v) => (
                <li key={v}>
                  <code className="rounded bg-paper px-2 py-1 text-xs text-moss">{v}</code>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </>
  );
}

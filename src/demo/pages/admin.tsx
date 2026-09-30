"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { LoginForm } from "@/components/admin/LoginForm";
import { CategoriesView } from "@/components/admin/views/CategoriesView";
import { ItemEditorView } from "@/components/admin/views/ItemEditorView";
import { LoginView } from "@/components/admin/views/LoginView";
import { MenuListView } from "@/components/admin/views/MenuListView";
import { OrdersView } from "@/components/admin/views/OrdersView";
import { OverviewView } from "@/components/admin/views/OverviewView";
import { SettingsView } from "@/components/admin/views/SettingsView";
import { EmptyState } from "@/components/admin/ui";
import { useHydrated } from "@/components/order/bag-store";
import { builtInImages } from "@/content/menu";
import type { FormState } from "@/lib/forms";
import { statsFor } from "@/lib/orders";
import { startOfStoreDay } from "@/lib/pickup";
import {
  demoCategoryActions,
  demoEditorActions,
  demoMenuActions,
  demoOrderActions,
  demoSettingsActions,
  demoSignIn,
  demoSignOut,
} from "../actions";
import { resetDemo, sortedCategories, sortedItems, useDemoState } from "../store";

const DEMO_EMAIL = "owner@matcha9.test";
const openStatuses = new Set(["received", "preparing", "ready"]);

/** "Now", refreshed every half minute so countdowns on the orders board keep moving. */
function useNow(every = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), every);
    return () => window.clearInterval(timer);
  }, [every]);
  return now;
}

function Waiting() {
  return (
    <p className="py-24 text-sm text-ink-soft" role="status">
      Opening the dashboard…
    </p>
  );
}

function PreviewNotice() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-paper px-5 py-3 text-sm text-ink-soft">
      <p>
        <span className="font-medium text-ink">Demo dashboard.</span> Changes are saved in this
        browser only, and show on the website straight away.
      </p>
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Reset the demo to the starting menu? This clears demo orders too.")) {
            resetDemo();
          }
        }}
        className="text-moss underline decoration-moss/30 underline-offset-4 hover:decoration-moss"
      >
        Reset demo
      </button>
    </div>
  );
}

/** Dashboard frame for the preview. Visitors sign in first (any email and password works). */
export function DemoDashboardShell({ children }: { children: ReactNode }) {
  const state = useDemoState();
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !state.signedIn) router.replace("/admin/login");
  }, [hydrated, state.signedIn, router]);

  const openOrders = state.orders.filter((o) => openStatuses.has(o.status)).length;
  return (
    <DashboardShell
      email={DEMO_EMAIL}
      openOrders={openOrders}
      signOut={async () => {
        await demoSignOut();
        router.push("/admin/login");
      }}
      notice={<PreviewNotice />}
    >
      {hydrated && state.signedIn ? children : <Waiting />}
    </DashboardShell>
  );
}

export function DemoOverview() {
  const state = useDemoState();
  const now = useNow();
  const recent = [...state.orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  return (
    <OverviewView
      stats={statsFor(state.orders, startOfStoreDay(now))}
      settings={state.settings}
      items={sortedItems(state)}
      recent={recent}
      toast={{ live: false }}
      now={now}
      actions={demoMenuActions}
    />
  );
}

export function DemoOrders() {
  const state = useDemoState();
  const now = useNow();
  const since = startOfStoreDay(now);
  const open = state.orders
    .filter((o) => openStatuses.has(o.status))
    .sort((a, b) => a.pickupAt.localeCompare(b.pickupAt) || a.createdAt.localeCompare(b.createdAt));
  const closed = state.orders
    .filter((o) => !openStatuses.has(o.status) && new Date(o.updatedAt) >= since)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <OrdersView open={open} closed={closed} now={now} actions={demoOrderActions} live={false} />
  );
}

function MenuListFromQuery() {
  const state = useDemoState();
  const deleted = useSearchParams().has("deleted");
  return (
    <MenuListView
      items={sortedItems(state)}
      categories={sortedCategories(state)}
      deleted={deleted}
      actions={demoMenuActions}
    />
  );
}

export function DemoMenuList() {
  return (
    <Suspense>
      <MenuListFromQuery />
    </Suspense>
  );
}

function EditorFromQuery({ isNew }: { isNew: boolean }) {
  const state = useDemoState();
  const params = useSearchParams();
  const id = params.get("id");
  const item = isNew ? null : (state.items.find((i) => i.id === id) ?? null);
  if (!isNew && !item) {
    return <EmptyState title="That drink isn’t here">It may have been deleted.</EmptyState>;
  }
  return (
    <ItemEditorView
      key={item?.id ?? "new"}
      item={item}
      categories={sortedCategories(state)}
      library={[...state.uploads, ...builtInImages()]}
      created={params.has("created")}
      actions={demoEditorActions}
    />
  );
}

export function DemoItemEditor({ isNew = false }: { isNew?: boolean }) {
  return (
    <Suspense>
      <EditorFromQuery isNew={isNew} />
    </Suspense>
  );
}

export function DemoCategories() {
  const state = useDemoState();
  return (
    <CategoriesView
      categories={sortedCategories(state)}
      items={state.items}
      actions={demoCategoryActions}
    />
  );
}

export function DemoSettings() {
  const state = useDemoState();
  return (
    <SettingsView settings={state.settings} toast={{ live: false }} actions={demoSettingsActions} />
  );
}

export function DemoLogin() {
  const router = useRouter();
  const signIn = async (prev: FormState, form: FormData) => {
    const result = await demoSignIn(prev, form);
    if (result?.ok) router.push("/admin");
    return result;
  };
  return (
    <LoginView
      note={
        <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
          Demo dashboard: sign in with any email and password. Nothing is sent anywhere.
        </p>
      }
    >
      <LoginForm next="/admin" signIn={signIn} />
    </LoginView>
  );
}

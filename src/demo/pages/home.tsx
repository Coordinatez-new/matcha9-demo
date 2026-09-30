"use client";

import { HomeView } from "@/components/views/HomeView";
import { hoursLine } from "@/lib/settings";
import { publicMenu, useDemoState } from "../store";

export function DemoHome() {
  const state = useDemoState();
  return <HomeView items={publicMenu(state).items} hours={hoursLine(state.settings.store.hours)} />;
}

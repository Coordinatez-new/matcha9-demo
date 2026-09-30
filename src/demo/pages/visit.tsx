"use client";

import { VisitView } from "@/components/views/VisitView";
import { hoursLine } from "@/lib/settings";
import { useDemoState } from "../store";

export function DemoVisit() {
  const { store } = useDemoState().settings;
  return <VisitView hours={hoursLine(store.hours)} hoursNote={store.hoursNote} />;
}

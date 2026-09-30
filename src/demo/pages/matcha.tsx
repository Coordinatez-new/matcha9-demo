"use client";

import { MatchaView } from "@/components/views/MatchaView";
import { publicMenu, useDemoState } from "../store";

export function DemoMatcha() {
  return <MatchaView items={publicMenu(useDemoState()).items} />;
}

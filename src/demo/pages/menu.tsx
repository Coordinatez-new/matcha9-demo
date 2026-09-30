"use client";

import { MenuView } from "@/components/views/MenuView";
import { publicMenu, useDemoState } from "../store";

export function DemoMenu() {
  const menu = publicMenu(useDemoState());
  return <MenuView items={menu.items} categories={menu.categories} />;
}

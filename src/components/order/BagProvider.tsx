"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { OrderableItem, SelectionInput } from "@/lib/menu";
import type { Storefront } from "@/lib/storefront";
import { bagStore, type BagLine } from "./bag-store";

type BagContextValue = {
  storefront: Storefront;
  lines: BagLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  /** Open the drawer, remembering what had focus so closing can hand it back. */
  openBag: () => void;
  closeBag: () => void;
  add: (item: OrderableItem, selections: SelectionInput, quantity?: number) => string | null;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Can guests add drinks right now? False when ordering is paused or handed to Toast. */
  canOrder: boolean;
};

const BagContext = createContext<BagContextValue | null>(null);

export function BagProvider({
  storefront,
  children,
}: {
  storefront: Storefront;
  children: ReactNode;
}) {
  const lines = useSyncExternalStore(
    bagStore.subscribe,
    bagStore.getSnapshot,
    bagStore.getServerSnapshot,
  );
  const [isOpen, setOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const openBag = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const closeBag = useCallback(() => {
    setOpen(false);
    // Hand focus back once the drawer is inert again.
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  }, []);

  const value = useMemo<BagContextValue>(
    () => ({
      storefront,
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0),
      isOpen,
      openBag,
      closeBag,
      add: (item, selections, quantity) => bagStore.add(item, selections, quantity),
      setQuantity: bagStore.setQuantity,
      remove: bagStore.remove,
      clear: bagStore.clear,
      canOrder: storefront.mode === "onsite",
    }),
    [storefront, lines, isOpen, openBag, closeBag],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) throw new Error("useBag must be used inside <BagProvider>");
  return context;
}

import type { Metadata } from "next";
import * as admin from "@/app/admin/actions";
import { MenuListView } from "@/components/admin/views/MenuListView";
import { requireAdmin } from "@/server/auth";
import { getAdminMenu } from "@/server/menu";

// Route type helpers (PageProps) don't cover `.server.tsx` pages, so props are typed here.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "Menu" };

export default async function MenuAdminPage(props: Props) {
  await requireAdmin();
  const { deleted } = await props.searchParams;
  const { items, categories } = await getAdminMenu();
  return (
    <MenuListView
      items={items}
      categories={categories}
      deleted={!!deleted}
      actions={{ setItemFlag: admin.setItemFlagAction, moveItem: admin.moveItemAction }}
    />
  );
}

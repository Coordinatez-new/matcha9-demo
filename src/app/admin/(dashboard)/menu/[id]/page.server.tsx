import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as admin from "@/app/admin/actions";
import { ItemEditorView } from "@/components/admin/views/ItemEditorView";
import { requireAdmin } from "@/server/auth";
import { getCategories, getItemById } from "@/server/menu";
import { listLibrary } from "@/server/media";
import { isUuid } from "@/server/orders";

// Route type helpers (PageProps) don't cover `.server.tsx` pages, so props are typed here.
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = { title: "Edit drink" };

const editorActions = {
  saveItem: admin.saveItemAction,
  deleteItem: admin.deleteItemAction,
  uploadImage: admin.uploadImageAction,
};

export default async function EditItemPage(props: Props) {
  await requireAdmin();
  const { id } = await props.params;
  const { created } = await props.searchParams;
  if (!isUuid(id)) notFound();
  const [item, categories, library] = await Promise.all([
    getItemById(id),
    getCategories(),
    listLibrary(),
  ]);
  if (!item) notFound();
  return (
    <ItemEditorView
      item={item}
      categories={categories}
      library={library}
      created={!!created}
      actions={editorActions}
    />
  );
}

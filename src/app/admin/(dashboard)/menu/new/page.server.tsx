import type { Metadata } from "next";
import * as admin from "@/app/admin/actions";
import { ItemEditorView } from "@/components/admin/views/ItemEditorView";
import { requireAdmin } from "@/server/auth";
import { getCategories } from "@/server/menu";
import { listLibrary } from "@/server/media";

export const metadata: Metadata = { title: "Add a drink" };

export default async function NewItemPage() {
  await requireAdmin();
  const [categories, library] = await Promise.all([getCategories(), listLibrary()]);
  return (
    <ItemEditorView
      item={null}
      categories={categories}
      library={library}
      actions={{
        saveItem: admin.saveItemAction,
        deleteItem: admin.deleteItemAction,
        uploadImage: admin.uploadImageAction,
      }}
    />
  );
}

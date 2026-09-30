import type { Metadata } from "next";
import * as admin from "@/app/admin/actions";
import { CategoriesView } from "@/components/admin/views/CategoriesView";
import { requireAdmin } from "@/server/auth";
import { getAdminMenu } from "@/server/menu";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requireAdmin();
  const { categories, items } = await getAdminMenu();
  return (
    <CategoriesView
      categories={categories}
      items={items}
      actions={{
        saveCategory: admin.saveCategoryAction,
        moveCategory: admin.moveCategoryAction,
        deleteCategory: admin.deleteCategoryAction,
      }}
    />
  );
}

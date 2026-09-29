import type { Metadata } from "next";
import Link from "next/link";
import { MenuItemEditor } from "@/components/admin/MenuItemEditor";
import { PageHeader } from "@/components/admin/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { getCategories } from "@/server/menu";
import { listLibrary } from "@/server/media";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Add a drink" };

export default async function NewItemPage() {
  await requireAdmin();
  const [categories, library] = await Promise.all([getCategories(), listLibrary()]);
  return (
    <>
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-moss"
      >
        <ChevronLeft className="size-4" /> Menu
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow="Menu"
          title="Add a drink"
          description="Fill in what guests should see. You can hide it until it’s ready."
        />
      </div>
      <MenuItemEditor item={null} categories={categories} library={library} />
    </>
  );
}

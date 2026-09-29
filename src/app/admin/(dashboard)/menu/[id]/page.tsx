import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MenuItemEditor } from "@/components/admin/MenuItemEditor";
import { PageHeader } from "@/components/admin/ui";
import { ChevronLeft } from "@/components/ui/icons";
import { getCategories, getItemById } from "@/server/menu";
import { listLibrary } from "@/server/media";
import { isUuid } from "@/server/orders";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Edit drink" };

export default async function EditItemPage(props: PageProps<"/admin/menu/[id]">) {
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
    <>
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-moss"
      >
        <ChevronLeft className="size-4" /> Menu
      </Link>
      <div className="mt-4">
        <PageHeader
          eyebrow={created ? "Added to the menu" : "Edit drink"}
          title={item.name}
          description="Changes appear on the website as soon as you save."
        />
      </div>
      <MenuItemEditor item={item} categories={categories} library={library} />
    </>
  );
}

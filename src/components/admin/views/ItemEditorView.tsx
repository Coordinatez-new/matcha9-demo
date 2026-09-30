import Link from "next/link";
import { MenuItemEditor } from "@/components/admin/MenuItemEditor";
import type { EditorActions } from "@/components/admin/types";
import { PageHeader } from "@/components/admin/ui";
import { ChevronLeft } from "@/components/ui/icons";
import type { Category, LibraryImage, MenuItem } from "@/lib/menu";

/** Add a drink (no item) or edit one. */
export function ItemEditorView({
  item,
  categories,
  library,
  created,
  actions,
}: {
  item: MenuItem | null;
  categories: Category[];
  library: LibraryImage[];
  created?: boolean;
  actions: EditorActions;
}) {
  return (
    <>
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-moss"
      >
        <ChevronLeft className="size-4" /> Menu
      </Link>
      <div className="mt-4">
        {item ? (
          <PageHeader
            eyebrow={created ? "Added to the menu" : "Edit drink"}
            title={item.name}
            description="Changes appear on the website as soon as you save."
          />
        ) : (
          <PageHeader
            eyebrow="Menu"
            title="Add a drink"
            description="Fill in what guests should see. You can hide it until it’s ready."
          />
        )}
      </div>
      <MenuItemEditor item={item} categories={categories} library={library} actions={actions} />
    </>
  );
}

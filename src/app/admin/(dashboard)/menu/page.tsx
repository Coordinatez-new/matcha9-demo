import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { moveItemAction, setItemFlagAction } from "@/app/admin/actions";
import { ActionButton, ActionSwitch } from "@/components/admin/controls";
import { Badge, EmptyState, PageHeader, adminButton } from "@/components/admin/ui";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { formatMoney } from "@/lib/menu";
import { getAdminMenu } from "@/server/menu";
import { requireAdmin } from "@/server/auth";

export const metadata: Metadata = { title: "Menu" };

export default async function MenuAdminPage(props: PageProps<"/admin/menu">) {
  await requireAdmin();
  const { deleted } = await props.searchParams;
  const { items, categories } = await getAdminMenu();
  const categoryName = new Map(categories.map((c) => [c.id, c.label]));

  return (
    <>
      <PageHeader
        eyebrow="Website menu"
        title="Menu"
        description="Everything guests can see and order. Edits go live the moment you save, no code needed."
        actions={
          <>
            <Link href="/admin/categories" className={adminButton.secondary}>
              Categories
            </Link>
            <Link href="/admin/menu/new" className={adminButton.primary}>
              Add a drink
            </Link>
          </>
        }
      />

      {deleted && (
        <p role="status" className="mt-6 rounded-lg bg-olive/10 px-4 py-3 text-sm text-sage-deep">
          Drink deleted.
        </p>
      )}

      {items.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No drinks yet">
            <Link href="/admin/menu/new" className="underline">
              Add your first drink
            </Link>{" "}
            to start the menu.
          </EmptyState>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-paper">
          <ul className="divide-y divide-line">
            {items.map((item, i) => {
              const image = item.productImage ?? item.photoImage;
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
                  <div className="flex min-w-[15rem] flex-1 items-center gap-4">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-cream">
                      {image && (
                        <Image
                          src={image.src}
                          alt=""
                          fill
                          sizes="56px"
                          className={
                            item.productImage
                              ? "object-contain p-1 mix-blend-multiply"
                              : "object-cover"
                          }
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/menu/${item.id}`}
                        className="font-medium text-ink hover:text-moss"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                        <span className="text-ink tabular-nums">
                          {formatMoney(item.priceCents)}
                        </span>
                        <span aria-hidden="true">·</span>
                        {item.categoryId ? categoryName.get(item.categoryId) : "No category"}
                        {item.badge && <Badge>{item.badge}</Badge>}
                        {item.featured && <Badge tone="green">Suggested</Badge>}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <ActionSwitch
                      checked={item.isVisible}
                      action={setItemFlagAction.bind(null, item.id, "isVisible")}
                      label={`${item.name} on the menu`}
                      onLabel="Showing"
                      offLabel="Hidden"
                    />
                    <ActionSwitch
                      checked={item.inStock}
                      action={setItemFlagAction.bind(null, item.id, "inStock")}
                      label={`${item.name} in stock`}
                      onLabel="In stock"
                      offLabel="Sold out"
                    />
                    <div className="flex items-center gap-2">
                      <ActionButton
                        action={moveItemAction.bind(null, item.id, -1)}
                        variant="icon"
                        className={i === 0 ? "invisible" : undefined}
                      >
                        <ChevronLeft className="size-4 rotate-90" />
                        <span className="sr-only">Move {item.name} up</span>
                      </ActionButton>
                      <ActionButton
                        action={moveItemAction.bind(null, item.id, 1)}
                        variant="icon"
                        className={i === items.length - 1 ? "invisible" : undefined}
                      >
                        <ChevronRight className="size-4 rotate-90" />
                        <span className="sr-only">Move {item.name} down</span>
                      </ActionButton>
                      <Link href={`/admin/menu/${item.id}`} className={adminButton.secondary}>
                        Edit
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="mt-4 text-sm text-ink-soft">
        Drinks show on the website in this order. “Hidden” takes a drink off the menu without
        deleting it; “Sold out” keeps it visible but stops orders.
      </p>
    </>
  );
}

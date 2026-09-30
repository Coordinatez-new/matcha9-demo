import Image from "next/image";
import Link from "next/link";
import { ActionButton, ActionSwitch } from "@/components/admin/controls";
import type { MenuActions } from "@/components/admin/types";
import { Badge, EmptyState, PageHeader, adminButton } from "@/components/admin/ui";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { formatMoney, type Category, type MenuItem } from "@/lib/menu";
import { adminItemHref, imageSrc } from "@/lib/paths";

/** Every drink, with the switches and ordering the owner uses day to day. */
export function MenuListView({
  items,
  categories,
  deleted,
  actions,
}: {
  items: MenuItem[];
  categories: Category[];
  deleted?: boolean;
  actions: MenuActions;
}) {
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
                          src={imageSrc(image.src)}
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
                        href={adminItemHref(item.id)}
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
                      action={actions.setItemFlag.bind(null, item.id, "isVisible")}
                      label={`${item.name} on the menu`}
                      onLabel="Showing"
                      offLabel="Hidden"
                    />
                    <ActionSwitch
                      checked={item.inStock}
                      action={actions.setItemFlag.bind(null, item.id, "inStock")}
                      label={`${item.name} in stock`}
                      onLabel="In stock"
                      offLabel="Sold out"
                    />
                    <div className="flex items-center gap-2">
                      <ActionButton
                        action={actions.moveItem.bind(null, item.id, -1)}
                        variant="icon"
                        className={i === 0 ? "invisible" : undefined}
                      >
                        <ChevronLeft className="size-4 rotate-90" />
                        <span className="sr-only">Move {item.name} up</span>
                      </ActionButton>
                      <ActionButton
                        action={actions.moveItem.bind(null, item.id, 1)}
                        variant="icon"
                        className={i === items.length - 1 ? "invisible" : undefined}
                      >
                        <ChevronRight className="size-4 rotate-90" />
                        <span className="sr-only">Move {item.name} down</span>
                      </ActionButton>
                      <Link href={adminItemHref(item.id)} className={adminButton.secondary}>
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

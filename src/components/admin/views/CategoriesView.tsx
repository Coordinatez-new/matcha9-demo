import { CategoryForm, NewCategoryForm } from "@/components/admin/CategoryForms";
import { ActionButton } from "@/components/admin/controls";
import type { CategoryActions } from "@/components/admin/types";
import { Card, PageHeader } from "@/components/admin/ui";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import type { Category, MenuItem } from "@/lib/menu";

/** The menu page's filters: rename, reorder, add and remove them. */
export function CategoriesView({
  categories,
  items,
  actions,
}: {
  categories: Category[];
  items: MenuItem[];
  actions: CategoryActions;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Menu"
        title="Categories"
        description="The filters on the website’s menu page. Categories without any drinks on the menu are hidden from guests."
      />

      <div className="mt-8 space-y-4">
        {categories.map((c, i) => {
          const count = items.filter((item) => item.categoryId === c.id).length;
          return (
            <Card key={c.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <CategoryForm category={c} save={actions.saveCategory} />
                <div className="flex items-center gap-2 lg:pt-6">
                  <span className="mr-2 text-xs whitespace-nowrap text-ink-soft">
                    {count} {count === 1 ? "drink" : "drinks"}
                  </span>
                  <ActionButton
                    action={actions.moveCategory.bind(null, c.id, -1)}
                    variant="icon"
                    className={i === 0 ? "invisible" : undefined}
                  >
                    <ChevronLeft className="size-4 rotate-90" />
                    <span className="sr-only">Move {c.label} up</span>
                  </ActionButton>
                  <ActionButton
                    action={actions.moveCategory.bind(null, c.id, 1)}
                    variant="icon"
                    className={i === categories.length - 1 ? "invisible" : undefined}
                  >
                    <ChevronRight className="size-4 rotate-90" />
                    <span className="sr-only">Move {c.label} down</span>
                  </ActionButton>
                  <ActionButton
                    action={actions.deleteCategory.bind(null, c.id)}
                    confirm={
                      count
                        ? `Delete “${c.label}”? Its ${count} drinks stay on the menu without a category.`
                        : `Delete “${c.label}”?`
                    }
                    variant="ghost"
                  >
                    Delete
                  </ActionButton>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <Card title="Add a category">
          <NewCategoryForm save={actions.saveCategory} />
        </Card>
      </div>
    </>
  );
}

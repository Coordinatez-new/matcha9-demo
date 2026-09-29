"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { deleteItemAction, saveItemAction, type ItemFormInput } from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import { slugify, type Category, type ImageRef, type MenuItem, type OptionGroup } from "@/lib/menu";
import type { LibraryImage } from "@/server/media";
import { ArrowUpRight, CloseIcon, Plus } from "@/components/ui/icons";
import { ImageField } from "./ImagePicker";
import { Card, Field, adminButton, inputClass } from "./ui";

type Draft = {
  name: string;
  slug: string;
  price: string;
  categoryId: string;
  badge: string;
  tagline: string;
  description: string;
  components: string[];
  options: OptionGroup[];
  hasIngredients: boolean;
  ingredients: NonNullable<MenuItem["ingredients"]>;
  productImage: ImageRef | null;
  productImageAlt: string;
  photoImage: ImageRef | null;
  photoImageAlt: string;
  toastUrl: string;
  toastGuid: string;
  isVisible: boolean;
  inStock: boolean;
  featured: boolean;
};

const shortId = () => crypto.randomUUID().slice(0, 8);

function toDraft(item: MenuItem | null, categories: Category[]): Draft {
  return {
    name: item?.name ?? "",
    slug: item?.slug ?? "",
    price: item ? (item.priceCents / 100).toFixed(2) : "",
    categoryId: item?.categoryId ?? categories[0]?.id ?? "",
    badge: item?.badge ?? "",
    tagline: item?.tagline ?? "",
    description: item?.description ?? "",
    components: item?.components ?? [],
    options: item?.options ?? [],
    hasIngredients: !!item?.ingredients,
    ingredients: item?.ingredients ?? { lede: "", groups: [], contains: "" },
    productImage: item?.productImage ?? null,
    productImageAlt: item?.productImageAlt ?? "",
    photoImage: item?.photoImage ?? null,
    photoImageAlt: item?.photoImageAlt ?? "",
    toastUrl: item?.toastUrl ?? "",
    toastGuid: item?.toastGuid ?? "",
    isVisible: item?.isVisible ?? true,
    inStock: item?.inStock ?? true,
    featured: item?.featured ?? false,
  };
}

function Check({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 accent-moss"
      />
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card title={title} description={description}>
      <div className="space-y-5">{children}</div>
    </Card>
  );
}

export function MenuItemEditor({
  item,
  categories,
  library: initialLibrary,
}: {
  item: MenuItem | null;
  categories: Category[];
  library: LibraryImage[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => toDraft(item, categories));
  const [slugEdited, setSlugEdited] = useState(!!item);
  const [library, setLibrary] = useState(initialLibrary);
  const [component, setComponent] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSaving] = useTransition();
  const [deleting, startDeleting] = useTransition();

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setMessage(null);
  };

  const setOption = (index: number, patch: Partial<OptionGroup>) =>
    set(
      "options",
      draft.options.map((g, i) => (i === index ? { ...g, ...patch } : g)),
    );

  const addComponent = () => {
    const value = component.trim();
    if (!value || draft.components.includes(value) || draft.components.length >= 8) return;
    set("components", [...draft.components, value]);
    setComponent("");
  };

  const save = () => {
    setErrors({});
    const price = Number(draft.price.replace(/[^0-9.]/g, ""));
    if (!draft.price.trim() || Number.isNaN(price)) {
      setErrors({ priceCents: "Add a price, like 6.00." });
      setMessage({ ok: false, text: "Some details need a look." });
      return;
    }
    const input: ItemFormInput = {
      name: draft.name,
      slug: draft.slug,
      priceCents: Math.round(price * 100),
      categoryId: draft.categoryId || null,
      badge: draft.badge,
      tagline: draft.tagline,
      description: draft.description,
      components: draft.components,
      ingredients: draft.hasIngredients ? draft.ingredients : null,
      options: draft.options,
      productImage: draft.productImage,
      productImageAlt: draft.productImageAlt,
      photoImage: draft.photoImage,
      photoImageAlt: draft.photoImageAlt,
      toastUrl: draft.toastUrl.trim(),
      toastGuid: draft.toastGuid.trim(),
      isVisible: draft.isVisible,
      inStock: draft.inStock,
      featured: draft.featured,
    };
    startSaving(async () => {
      const result = await saveItemAction(item?.id ?? null, input);
      if (!result.ok) {
        setErrors(result.fields);
        setMessage({ ok: false, text: result.message });
        return;
      }
      setMessage({ ok: true, text: "Saved. It’s live on the website." });
      if (!item) router.replace(`/admin/menu/${result.id}?created=1`);
      else router.refresh();
    });
  };

  const optionErrors = Object.entries(errors).filter(([k]) => k.startsWith("options"));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="mt-8 grid items-start gap-6 xl:grid-cols-[1fr_20rem]"
      noValidate
    >
      <div className="space-y-6">
        <Section title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" error={errors.name} className="sm:col-span-2">
              <input
                value={draft.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setDraft((d) => ({ ...d, name, slug: slugEdited ? d.slug : slugify(name) }));
                  setMessage(null);
                }}
                maxLength={60}
                aria-invalid={!!errors.name}
                className={inputClass}
                placeholder="e.g. Honey Lavender Matcha"
              />
            </Field>
            <Field label="Web address" hint={`/menu/${draft.slug || "…"}`} error={errors.slug}>
              <input
                value={draft.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", slugify(e.target.value));
                }}
                maxLength={60}
                aria-invalid={!!errors.slug}
                className={inputClass}
              />
            </Field>
            <Field label="Price" hint="US dollars" error={errors.priceCents}>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft">
                  $
                </span>
                <input
                  value={draft.price}
                  onChange={(e) => set("price", e.target.value)}
                  inputMode="decimal"
                  aria-invalid={!!errors.priceCents}
                  className={cn(inputClass, "pl-7")}
                  placeholder="6.00"
                />
              </div>
            </Field>
            <Field label="Category">
              <select
                value={draft.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={inputClass}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Badge" hint="Optional, e.g. New" error={errors.badge}>
              <input
                value={draft.badge}
                onChange={(e) => set("badge", e.target.value)}
                maxLength={20}
                className={inputClass}
              />
            </Field>
            <Field
              label="Tagline"
              hint="One short line"
              error={errors.tagline}
              className="sm:col-span-2"
            >
              <input
                value={draft.tagline}
                onChange={(e) => set("tagline", e.target.value)}
                maxLength={140}
                className={inputClass}
              />
            </Field>
            <Field label="Description" error={errors.description} className="sm:col-span-2">
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                maxLength={1500}
                className={cn(inputClass, "resize-y")}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="In the glass"
          description="The short menu line, one part at a time: shown on cards as “Pistachio · Matcha · Roasted Pistachio Finish”."
        >
          {draft.components.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {draft.components.map((c) => (
                <li
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-cream py-1 pr-1 pl-3 text-sm text-moss"
                >
                  {c}
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "components",
                        draft.components.filter((x) => x !== c),
                      )
                    }
                    className="grid size-6 place-items-center rounded-full text-ink-soft hover:bg-line hover:text-ink"
                    aria-label={`Remove ${c}`}
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <input
              value={component}
              onChange={(e) => setComponent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addComponent();
                }
              }}
              maxLength={40}
              placeholder="e.g. Oat Milk"
              className={inputClass}
              aria-label="Add a part"
            />
            <button type="button" onClick={addComponent} className={adminButton.secondary}>
              Add
            </button>
          </div>
        </Section>

        <Section
          title="Photos"
          description="Guests can switch between the two on the drink’s page."
        >
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <ImageField
                label="Studio shot"
                hint="The drink on a plain white background."
                value={draft.productImage}
                onChange={(img) => set("productImage", img)}
                library={library}
                onUploaded={(img) => setLibrary((l) => [img, ...l])}
                kind="product"
              />
              <Field label="Describe it" hint="For screen readers" error={errors.productImageAlt}>
                <input
                  value={draft.productImageAlt}
                  onChange={(e) => set("productImageAlt", e.target.value)}
                  maxLength={200}
                  className={inputClass}
                  placeholder="Very Berry: pink berry cream over layered matcha"
                />
              </Field>
            </div>
            <div className="space-y-3">
              <ImageField
                label="At the bar"
                hint="A real photo, portrait works best."
                value={draft.photoImage}
                onChange={(img) => set("photoImage", img)}
                library={library}
                onUploaded={(img) => setLibrary((l) => [img, ...l])}
                kind="photo"
              />
              <Field label="Describe it" hint="For screen readers" error={errors.photoImageAlt}>
                <input
                  value={draft.photoImageAlt}
                  onChange={(e) => set("photoImageAlt", e.target.value)}
                  maxLength={200}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section
          title="Options"
          description="Choices guests make when ordering, like Serve: Iced or Hot. Leave empty if there are none."
        >
          {draft.options.map((group, gi) => (
            <div key={group.id} className="rounded-lg border border-line bg-cream/50 p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <Field label="Option name" error={errors[`options.${gi}.name`]}>
                  <input
                    value={group.name}
                    onChange={(e) => setOption(gi, { name: e.target.value })}
                    maxLength={40}
                    className={inputClass}
                    placeholder="e.g. Milk"
                  />
                </Field>
                <Field label="Guests pick">
                  <select
                    value={group.type}
                    onChange={(e) => setOption(gi, { type: e.target.value as OptionGroup["type"] })}
                    className={inputClass}
                  >
                    <option value="single">One</option>
                    <option value="multi">Any number</option>
                  </select>
                </Field>
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "options",
                      draft.options.filter((_, i) => i !== gi),
                    )
                  }
                  className={adminButton.ghost}
                >
                  Remove option
                </button>
              </div>
              <div className="mt-4">
                <Check
                  checked={group.required}
                  onChange={(v) => setOption(gi, { required: v })}
                  label="Required"
                  hint="Guests must choose one (the default is pre-selected)."
                />
              </div>
              <ul className="mt-4 space-y-2">
                {group.choices.map((choice, ci) => (
                  <li
                    key={choice.id}
                    className="grid grid-cols-[1fr_7rem_auto] items-center gap-2 sm:grid-cols-[1fr_7rem_auto_auto]"
                  >
                    <input
                      value={choice.label}
                      onChange={(e) =>
                        setOption(gi, {
                          choices: group.choices.map((c, i) =>
                            i === ci ? { ...c, label: e.target.value } : c,
                          ),
                        })
                      }
                      maxLength={40}
                      className={inputClass}
                      placeholder="Choice"
                      aria-label="Choice name"
                    />
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-ink-soft">
                        +$
                      </span>
                      <input
                        value={choice.priceCents ? (choice.priceCents / 100).toFixed(2) : ""}
                        onChange={(e) => {
                          const n = Number(e.target.value.replace(/[^0-9.]/g, ""));
                          setOption(gi, {
                            choices: group.choices.map((c, i) =>
                              i === ci
                                ? { ...c, priceCents: Number.isNaN(n) ? 0 : Math.round(n * 100) }
                                : c,
                            ),
                          });
                        }}
                        inputMode="decimal"
                        className={cn(inputClass, "pl-8")}
                        placeholder="0.00"
                        aria-label="Extra charge"
                      />
                    </div>
                    {group.type === "single" && (
                      <label className="hidden items-center gap-1.5 text-xs text-ink-soft sm:flex">
                        <input
                          type="radio"
                          name={`default-${group.id}`}
                          checked={group.defaultChoiceId === choice.id}
                          onChange={() => setOption(gi, { defaultChoiceId: choice.id })}
                          className="accent-moss"
                        />
                        Default
                      </label>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setOption(gi, {
                          choices: group.choices.filter((_, i) => i !== ci),
                          defaultChoiceId:
                            group.defaultChoiceId === choice.id ? null : group.defaultChoiceId,
                        })
                      }
                      className={adminButton.icon}
                      aria-label={`Remove ${choice.label || "choice"}`}
                    >
                      <CloseIcon className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() =>
                  setOption(gi, {
                    choices: [...group.choices, { id: shortId(), label: "", priceCents: 0 }],
                  })
                }
                className={cn(adminButton.ghost, "mt-3")}
              >
                <Plus className="size-4" /> Add a choice
              </button>
            </div>
          ))}
          {optionErrors.length > 0 && (
            <p className="text-sm text-terracotta-deep">{optionErrors[0]![1]}</p>
          )}
          <button
            type="button"
            onClick={() =>
              set("options", [
                ...draft.options,
                {
                  id: shortId(),
                  name: "",
                  type: "single",
                  required: true,
                  defaultChoiceId: null,
                  choices: [{ id: shortId(), label: "", priceCents: 0 }],
                },
              ])
            }
            className={adminButton.secondary}
            disabled={draft.options.length >= 6}
          >
            <Plus className="size-4" /> Add an option
          </button>
        </Section>

        <Section
          title="Full ingredient list"
          description="For drinks like the wellness blends, where you publish every ingredient."
        >
          <Check
            checked={draft.hasIngredients}
            onChange={(v) => set("hasIngredients", v)}
            label="Show an ingredient list on this drink’s page"
          />
          {draft.hasIngredients && (
            <>
              <Field label="Introduction">
                <input
                  value={draft.ingredients.lede}
                  onChange={(e) =>
                    set("ingredients", { ...draft.ingredients, lede: e.target.value })
                  }
                  maxLength={400}
                  className={inputClass}
                />
              </Field>
              {draft.ingredients.groups.map((g, i) => (
                <div
                  key={i}
                  className="grid gap-3 rounded-lg border border-line bg-cream/50 p-4 sm:grid-cols-[12rem_1fr_auto]"
                >
                  <input
                    value={g.title}
                    onChange={(e) =>
                      set("ingredients", {
                        ...draft.ingredients,
                        groups: draft.ingredients.groups.map((x, j) =>
                          j === i ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Group, e.g. Enzymes"
                    className={inputClass}
                    aria-label="Group name"
                  />
                  <textarea
                    value={g.items}
                    onChange={(e) =>
                      set("ingredients", {
                        ...draft.ingredients,
                        groups: draft.ingredients.groups.map((x, j) =>
                          j === i ? { ...x, items: e.target.value } : x,
                        ),
                      })
                    }
                    rows={2}
                    placeholder="Ingredients, separated by commas"
                    className={cn(inputClass, "resize-y")}
                    aria-label="Ingredients"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set("ingredients", {
                        ...draft.ingredients,
                        groups: draft.ingredients.groups.filter((_, j) => j !== i),
                      })
                    }
                    className={adminButton.icon}
                    aria-label="Remove group"
                  >
                    <CloseIcon className="size-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  set("ingredients", {
                    ...draft.ingredients,
                    groups: [...draft.ingredients.groups, { title: "", items: "" }],
                  })
                }
                className={adminButton.secondary}
              >
                <Plus className="size-4" /> Add a group
              </button>
              <Field label="Contains" hint="Allergens">
                <input
                  value={draft.ingredients.contains}
                  onChange={(e) =>
                    set("ingredients", { ...draft.ingredients, contains: e.target.value })
                  }
                  maxLength={500}
                  className={inputClass}
                />
              </Field>
            </>
          )}
        </Section>

        <Section
          title="Toast"
          description="Links this drink to your Toast POS: for sending website orders to Toast, and for “Order on Toast” buttons when ordering is handed to Toast."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Toast item link" error={errors.toastUrl} className="sm:col-span-2">
              <input
                value={draft.toastUrl}
                onChange={(e) => set("toastUrl", e.target.value)}
                className={inputClass}
                placeholder="https://tacomaya.toast.site/order/…/item-…"
              />
            </Field>
            <Field
              label="Toast item ID"
              hint="The long code at the end of the link"
              error={errors.toastGuid}
            >
              <input
                value={draft.toastGuid}
                onChange={(e) => set("toastGuid", e.target.value)}
                className={cn(inputClass, "font-mono text-sm")}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  const match = draft.toastUrl.match(
                    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
                  );
                  if (match) set("toastGuid", match[0]);
                }}
                className={adminButton.ghost}
                disabled={!draft.toastUrl}
              >
                Take the ID from the link
              </button>
            </div>
          </div>
        </Section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8">
        <Card title={item ? "Publish" : "New drink"}>
          <div className="space-y-4">
            <Check
              checked={draft.isVisible}
              onChange={(v) => set("isVisible", v)}
              label="Show on the menu"
              hint="Off hides it from the website."
            />
            <Check
              checked={draft.inStock}
              onChange={(v) => set("inStock", v)}
              label="In stock"
              hint="Off shows “Sold out today”."
            />
            <Check
              checked={draft.featured}
              onChange={(v) => set("featured", v)}
              label="Suggest in the bag"
              hint="Offered when a guest’s bag is empty."
            />
          </div>
          {message && (
            <p
              role={message.ok ? "status" : "alert"}
              className={cn("mt-5 text-sm", message.ok ? "text-sage-deep" : "text-terracotta-deep")}
            >
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className={cn(adminButton.primary, "mt-5 w-full py-3")}
          >
            {saving ? "Saving…" : item ? "Save changes" : "Add to the menu"}
          </button>
          {item && (
            <Link
              href={`/menu/${item.slug}`}
              target="_blank"
              className={cn(adminButton.ghost, "mt-2 w-full")}
            >
              View on the website <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </Card>
        {item && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (
                !window.confirm(
                  `Delete ${item.name}? This can’t be undone. To take it off the menu for now, untick “Show on the menu” instead.`,
                )
              )
                return;
              startDeleting(() => deleteItemAction(item.id));
            }}
            className={cn(adminButton.danger, "w-full")}
          >
            {deleting ? "Deleting…" : "Delete this drink"}
          </button>
        )}
      </aside>
    </form>
  );
}

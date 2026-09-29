"use client";

import { useActionState, useState } from "react";
import { saveCategoryAction, type FormState } from "@/app/admin/actions";
import { slugify, type Category } from "@/lib/menu";
import { FormMessage, SubmitButton } from "./controls";
import { Field, inputClass } from "./ui";

/** Inline editor for one existing category. Its id (used in links) never changes. */
export function CategoryForm({ category }: { category: Category }) {
  const [state, action] = useActionState<FormState, FormData>(saveCategoryAction, null);
  return (
    <form action={action} className="grid flex-1 gap-3 md:grid-cols-[14rem_1fr_auto] md:items-end">
      <input type="hidden" name="id" value={category.id} />
      <Field label="Name" error={state?.fields?.label}>
        <input name="label" defaultValue={category.label} maxLength={40} className={inputClass} />
      </Field>
      <Field label="Description" hint="Optional" error={state?.fields?.description}>
        <input
          name="description"
          defaultValue={category.description}
          maxLength={160}
          className={inputClass}
        />
      </Field>
      <div className="flex items-center gap-3 md:pb-0.5">
        <SubmitButton variant="secondary">Save</SubmitButton>
      </div>
      <div className="md:col-span-3">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function NewCategoryForm() {
  const [label, setLabel] = useState("");
  const [state, action] = useActionState<FormState, FormData>(async (prev, form) => {
    const result = await saveCategoryAction(prev, form);
    if (result?.ok) setLabel("");
    return result;
  }, null);
  return (
    <form action={action} className="grid gap-3 md:grid-cols-[14rem_1fr_auto] md:items-end">
      <input type="hidden" name="isNew" value="1" />
      <input type="hidden" name="id" value={slugify(label)} />
      <Field label="Name" error={state?.fields?.label ?? state?.fields?.id}>
        <input
          name="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={40}
          className={inputClass}
          placeholder="e.g. Seasonal"
        />
      </Field>
      <Field label="Description" hint="Optional">
        <input name="description" maxLength={160} className={inputClass} />
      </Field>
      <SubmitButton pendingLabel="Adding…">Add category</SubmitButton>
      <div className="md:col-span-3">
        <FormMessage state={state} />
      </div>
    </form>
  );
}

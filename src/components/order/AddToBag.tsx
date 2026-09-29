"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  defaultSelections,
  formatMoney,
  resolveSelections,
  type OptionGroup,
  type OrderableItem,
  type SelectionInput,
} from "@/lib/menu";
import { buttonClasses, ButtonLink } from "@/components/ui/Button";
import { useBag } from "./BagProvider";
import { OpenStatus } from "./OpenStatus";
import { QuantityStepper } from "./QuantityStepper";

function OptionPicker({
  group,
  selected,
  onToggle,
}: {
  group: OptionGroup;
  selected: string[];
  onToggle: (choiceId: string) => void;
}) {
  const single = group.type === "single";
  return (
    <fieldset>
      <legend className="eyebrow text-sage-deep">
        {group.name}
        {!group.required && <span className="font-normal text-sage"> · optional</span>}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {group.choices.map((choice) => {
          const checked = selected.includes(choice.id);
          return (
            <label
              key={choice.id}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-moss",
                checked
                  ? "border-moss bg-moss text-cream"
                  : "border-line bg-paper text-moss hover:border-moss/40",
              )}
            >
              <input
                type={single ? "radio" : "checkbox"}
                name={`option-${group.id}`}
                value={choice.id}
                checked={checked}
                onChange={() => onToggle(choice.id)}
                className="sr-only"
              />
              {choice.label}
              {choice.priceCents > 0 && (
                <span className={checked ? "text-cream/70" : "text-ink-soft"}>
                  {" "}
                  +{formatMoney(choice.priceCents)}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Options, quantity and "Add to bag" on a drink's page. */
export function AddToBag({ item, toastUrl }: { item: OrderableItem; toastUrl: string | null }) {
  const { storefront, add, openBag } = useBag();
  const [selections, setSelections] = useState<SelectionInput>(() => defaultSelections(item));
  const [quantity, setQuantity] = useState(1);

  if (storefront.mode === "toast") {
    return (
      <div className="space-y-4">
        <ButtonLink href={toastUrl ?? storefront.toastUrl} external>
          Order pickup on Toast
        </ButtonLink>
        <p className="text-sm text-ink-soft">
          Online orders are taken on our Toast ordering page, for pickup or delivery.
        </p>
      </div>
    );
  }

  if (storefront.mode === "paused") {
    return <OpenStatus storefront={storefront} className="rounded-lg bg-paper p-5" />;
  }

  if (!item.inStock) {
    return (
      <div className="space-y-4">
        <button type="button" disabled className={buttonClasses("primary")}>
          Sold out today
        </button>
        <p className="text-sm text-ink-soft">
          We’ve run out of this one for now. It’ll be back soon.
        </p>
      </div>
    );
  }

  const resolved = resolveSelections(item, selections);
  const unit = resolved.ok ? resolved.unitPriceCents : item.priceCents;

  const toggle = (group: OptionGroup, choiceId: string) =>
    setSelections((current) => {
      const picked = current[group.id] ?? [];
      if (group.type === "single") {
        const same = picked[0] === choiceId;
        return { ...current, [group.id]: same && !group.required ? [] : [choiceId] };
      }
      return {
        ...current,
        [group.id]: picked.includes(choiceId)
          ? picked.filter((id) => id !== choiceId)
          : [...picked, choiceId],
      };
    });

  return (
    <div className="space-y-7">
      {item.options.length > 0 && (
        <div className="space-y-6">
          {item.options.map((group) => (
            <OptionPicker
              key={group.id}
              group={group}
              selected={selections[group.id] ?? []}
              onToggle={(choiceId) => toggle(group, choiceId)}
            />
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} label="Quantity" />
        <button
          type="button"
          onClick={() => {
            if (add(item, selections, quantity)) {
              setQuantity(1);
              openBag();
            }
          }}
          className={buttonClasses("primary")}
        >
          Add to bag · {formatMoney(unit * quantity)}
        </button>
      </div>
      <OpenStatus storefront={storefront} />
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import {
  saveAnnouncementAction,
  saveHoursAction,
  saveOrderingAction,
  saveToastAction,
  type FormState,
} from "@/app/admin/actions";
import { cn } from "@/lib/cn";
import {
  weekdays,
  type AnnouncementSettings,
  type OrderingSettings,
  type StoreSettings,
  type ToastSettings,
} from "@/lib/settings";
import { FormMessage, SubmitButton } from "./controls";
import { Field, inputClass } from "./ui";

function Footer({ state }: { state: FormState }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-line pt-5">
      <FormMessage state={state} />
      <SubmitButton>Save</SubmitButton>
    </div>
  );
}

const modeCopy: Record<OrderingSettings["mode"], { title: string; body: string }> = {
  onsite: {
    title: "Take orders on this website",
    body: "Guests check out here and pay at pickup. Orders appear on the Orders page.",
  },
  paused: {
    title: "Pause online ordering",
    body: "Buttons switch off; guests see the message below.",
  },
  toast: {
    title: "Send guests to Toast",
    body: "Order buttons open your Toast online ordering page.",
  },
};

export function OrderingForm({ value }: { value: OrderingSettings }) {
  const [state, action] = useActionState<FormState, FormData>(saveOrderingAction, null);
  const [mode, setMode] = useState(value.mode);
  return (
    <form action={action}>
      <fieldset>
        <legend className="text-sm font-medium text-ink">How guests order</legend>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(Object.keys(modeCopy) as OrderingSettings["mode"][]).map((m) => (
            <label
              key={m}
              className={cn(
                "cursor-pointer rounded-lg border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-moss",
                mode === m ? "border-moss bg-cream" : "border-line hover:border-moss/40",
              )}
            >
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
                className="sr-only"
              />
              <span className="block font-medium text-ink">{modeCopy[m].title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-soft">
                {modeCopy[m].body}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <Field label="Prep time" hint="minutes" error={state?.fields?.prepMinutes}>
          <input
            name="prepMinutes"
            type="number"
            min={0}
            max={120}
            defaultValue={value.prepMinutes}
            className={inputClass}
          />
        </Field>
        <Field label="Pickup times every" hint="minutes" error={state?.fields?.slotMinutes}>
          <select
            name="slotMinutes"
            defaultValue={String(value.slotMinutes)}
            className={inputClass}
          >
            {[5, 10, 15, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </Field>
        <Field label="Schedule ahead" error={state?.fields?.daysAhead}>
          <select name="daysAhead" defaultValue={String(value.daysAhead)} className={inputClass}>
            <option value="0">Today only</option>
            <option value="1">Today and tomorrow</option>
            <option value="2">Up to 2 days ahead</option>
            <option value="3">Up to 3 days ahead</option>
            <option value="7">Up to a week ahead</option>
          </select>
        </Field>
        <Field
          label="Pickup instructions"
          hint="Shown after ordering"
          error={state?.fields?.pickupInstructions}
          className="sm:col-span-3"
        >
          <input
            name="pickupInstructions"
            defaultValue={value.pickupInstructions}
            maxLength={240}
            className={inputClass}
          />
        </Field>
        <Field
          label="Message while paused"
          error={state?.fields?.pausedMessage}
          className="sm:col-span-3"
        >
          <input
            name="pausedMessage"
            defaultValue={value.pausedMessage}
            maxLength={240}
            className={inputClass}
          />
        </Field>
      </div>
      <Footer state={state} />
    </form>
  );
}

export function HoursForm({ value }: { value: StoreSettings }) {
  const [state, action] = useActionState<FormState, FormData>(saveHoursAction, null);
  const [closed, setClosed] = useState(value.hours.map((d) => d.closed));
  // Show Monday first, like a printed week.
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <form action={action}>
      <ul className="divide-y divide-line">
        {order.map((d) => (
          <li
            key={d}
            className="grid grid-cols-[6.5rem_1fr] items-center gap-3 py-3 sm:grid-cols-[8rem_7rem_1fr]"
          >
            <span className="text-sm font-medium text-ink">{weekdays[d]}</span>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                name={`closed-${d}`}
                checked={closed[d]}
                onChange={(e) =>
                  setClosed((c) => c.map((v, i) => (i === d ? e.target.checked : v)))
                }
                className="size-4 accent-moss"
              />
              Closed
            </label>
            <div
              className={cn(
                "col-span-2 flex items-center gap-2 sm:col-span-1",
                closed[d] && "opacity-40",
              )}
            >
              <input
                type="time"
                name={`open-${d}`}
                defaultValue={value.hours[d]?.open}
                step={900}
                disabled={closed[d]}
                aria-label={`${weekdays[d]} opens`}
                className={cn(inputClass, "w-auto")}
              />
              <span className="text-sm text-ink-soft">to</span>
              <input
                type="time"
                name={`close-${d}`}
                defaultValue={value.hours[d]?.close}
                step={900}
                disabled={closed[d]}
                aria-label={`${weekdays[d]} closes`}
                className={cn(inputClass, "w-auto")}
              />
              {closed[d] && (
                <>
                  <input type="hidden" name={`open-${d}`} value={value.hours[d]?.open ?? "09:00"} />
                  <input
                    type="hidden"
                    name={`close-${d}`}
                    value={value.hours[d]?.close ?? "14:00"}
                  />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Field label="Note next to the hours" hint="Optional">
          <input
            name="hoursNote"
            defaultValue={value.hoursNote}
            maxLength={160}
            className={inputClass}
            placeholder="e.g. Hours may change on holidays"
          />
        </Field>
      </div>
      <Footer state={state} />
    </form>
  );
}

export function AnnouncementForm({ value }: { value: AnnouncementSettings }) {
  const [state, action] = useActionState<FormState, FormData>(saveAnnouncementAction, null);
  return (
    <form action={action}>
      <label className="flex items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={value.enabled}
          className="size-4 accent-moss"
        />
        Show the announcement bar
      </label>
      <div className="mt-5 grid gap-5 sm:grid-cols-[8rem_1fr]">
        <Field label="Label" hint="Optional" error={state?.fields?.label}>
          <input
            name="label"
            defaultValue={value.label}
            maxLength={16}
            className={inputClass}
            placeholder="New"
          />
        </Field>
        <Field label="Text" error={state?.fields?.text}>
          <input name="text" defaultValue={value.text} maxLength={140} className={inputClass} />
        </Field>
        <Field
          label="Link"
          hint="A page like /menu/very-berry, or a full https:// link"
          error={state?.fields?.href}
          className="sm:col-span-2"
        >
          <input name="href" defaultValue={value.href} maxLength={300} className={inputClass} />
        </Field>
      </div>
      <Footer state={state} />
    </form>
  );
}

export function ToastForm({ value }: { value: ToastSettings }) {
  const [state, action] = useActionState<FormState, FormData>(saveToastAction, null);
  return (
    <form action={action}>
      <Field
        label="Toast online ordering page"
        hint="Used for delivery and when ordering is handed to Toast"
        error={state?.fields?.onlineOrderingUrl}
      >
        <input
          name="onlineOrderingUrl"
          type="url"
          defaultValue={value.onlineOrderingUrl}
          className={inputClass}
        />
      </Field>
      <Footer state={state} />
    </form>
  );
}

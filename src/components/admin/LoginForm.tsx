"use client";

import { useActionState } from "react";
import type { FormAction } from "@/components/admin/types";
import type { FormState } from "@/lib/forms";
import { FormMessage, SubmitButton } from "@/components/admin/controls";
import { Field, inputClass } from "@/components/admin/ui";

export function LoginForm({ next, signIn }: { next: string; signIn: FormAction }) {
  const [state, action] = useActionState<FormState, FormData>(signIn, null);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field label="Email">
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className={inputClass}
        />
      </Field>
      <Field label="Password">
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Signing in…" className="w-full py-3">
        Sign in
      </SubmitButton>
    </form>
  );
}

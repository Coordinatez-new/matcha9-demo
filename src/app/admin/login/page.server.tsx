import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { LoginForm } from "@/components/admin/LoginForm";
import { LoginView } from "@/components/admin/views/LoginView";
import { adminSetup, getAdmin } from "@/server/auth";

// Route type helpers (PageProps) don't cover `.server.tsx` pages, so props are typed here.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: Props) {
  if (await getAdmin()) redirect("/admin");
  const { next } = await props.searchParams;
  const setup = adminSetup();

  return (
    <LoginView>
      {setup === "ready" ? (
        <LoginForm next={typeof next === "string" ? next : "/admin"} signIn={loginAction} />
      ) : (
        <p className="text-sm leading-relaxed text-ink-soft">
          {setup === "example-password" ? (
            <>
              This server is still using the example password from <code>.env.example</code>. Set
              your own <code>ADMIN_PASSWORD</code> in its environment and restart it.
            </>
          ) : (
            <>
              Sign-in isn’t set up on this server yet. Add <code>ADMIN_EMAIL</code> and{" "}
              <code>ADMIN_PASSWORD</code> to its environment (see <code>.env.example</code>) and
              restart it.
            </>
          )}
        </p>
      )}
    </LoginView>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import logo from "@/assets/brand/matcha9-logo.webp";
import { adminSetup, getAdmin } from "@/server/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { next } = await props.searchParams;
  const setup = adminSetup();

  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Image src={logo} alt="Matcha 9" className="mx-auto h-16 w-auto" preload />
          <h1 className="mt-6 font-display text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-ink-soft">Menu, orders and settings for Matcha 9.</p>
        </div>
        <div className="mt-10 rounded-xl border border-line bg-paper p-7">
          {setup === "ready" ? (
            <LoginForm next={typeof next === "string" ? next : "/admin"} />
          ) : (
            <p className="text-sm leading-relaxed text-ink-soft">
              {setup === "example-password" ? (
                <>
                  This server is still using the example password from <code>.env.example</code>.
                  Set your own <code>ADMIN_PASSWORD</code> in its environment and restart it.
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
        </div>
        <p className="mt-6 text-center text-sm">
          <Link
            href="/"
            className="text-ink-soft underline decoration-line underline-offset-4 hover:text-moss"
          >
            Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}

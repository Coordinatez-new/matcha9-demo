import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import logo from "@/assets/brand/matcha9-logo.webp";

/** The sign-in screen's frame; the form (or a setup note) goes inside. */
export function LoginView({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Image src={logo} alt="Matcha 9" className="mx-auto h-16 w-auto" preload />
          <h1 className="mt-6 font-display text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-ink-soft">Menu, orders and settings for Matcha 9.</p>
        </div>
        <div className="mt-10 rounded-xl border border-line bg-paper p-7">{children}</div>
        {note}
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

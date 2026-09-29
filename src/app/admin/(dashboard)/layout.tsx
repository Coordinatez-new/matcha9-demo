import Image from "next/image";
import Link from "next/link";
import logoCream from "@/assets/brand/matcha9-logo-cream.webp";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { ArrowUpRight } from "@/components/ui/icons";
import { requireAdmin } from "@/server/auth";
import { orderStats } from "@/server/orders";

export default async function DashboardLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const stats = await orderStats();
  const open = stats.received + stats.preparing + stats.ready;

  const footer = (
    <div className="space-y-1 text-sm">
      <Link
        href="/"
        target="_blank"
        className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-cream/65 transition-colors hover:bg-cream/6 hover:text-cream"
      >
        View website <ArrowUpRight className="size-3.5" />
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full rounded-lg px-3.5 py-2.5 text-left text-cream/65 transition-colors hover:bg-cream/6 hover:text-cream"
        >
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col bg-forest px-4 py-6 text-cream lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link href="/admin" className="flex items-center gap-3 px-2">
          <Image src={logoCream} alt="" className="h-10 w-auto" />
          <span>
            <span className="block font-display text-lg tracking-[0.2em] uppercase">Matcha 9</span>
            <span className="block text-[0.7rem] tracking-[0.18em] text-cream/50 uppercase">
              Dashboard
            </span>
          </span>
        </Link>
        <div className="mt-10 flex-1">
          <AdminNav openOrders={open} layout="side" />
        </div>
        <p className="truncate px-3.5 pb-3 text-xs text-cream/40" title={admin.email}>
          {admin.email}
        </p>
        {footer}
      </aside>

      <header className="bg-forest px-4 pt-4 pb-3 text-cream lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src={logoCream} alt="" className="h-8 w-auto" />
            <span className="font-display tracking-[0.2em] uppercase">Dashboard</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-cream/70 hover:text-cream">
              Sign out
            </button>
          </form>
        </div>
        <div className="mt-3">
          <AdminNav openOrders={open} layout="top" />
        </div>
      </header>

      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

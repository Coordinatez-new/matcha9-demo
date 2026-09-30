import type { Metadata } from "next";
import { DemoLogin } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <DemoLogin />;
}

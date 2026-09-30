import type { Metadata } from "next";
import { DemoItemEditor } from "@/demo/pages/admin";

export const metadata: Metadata = { title: "Add a drink" };

export default function Page() {
  return <DemoItemEditor isNew />;
}

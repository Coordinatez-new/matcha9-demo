import Link from "next/link";
import { EmptyState, adminButton } from "@/components/admin/ui";

export default function DashboardNotFound() {
  return (
    <div className="py-16">
      <EmptyState title="That page isn’t here">
        It may have been deleted, or the link is out of date.
        <div className="mt-6">
          <Link href="/admin" className={adminButton.primary}>
            Back to the overview
          </Link>
        </div>
      </EmptyState>
    </div>
  );
}

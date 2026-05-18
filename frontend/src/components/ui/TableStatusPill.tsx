import { Badge } from "@/components/ui/Badge";
import { tableStatusLabels, tableStatusStyles } from "@/lib/constants";

export function TableStatusPill({ status }: { status: string }) {
  return <Badge className={tableStatusStyles[status] || "border-stone-200 bg-stone-100 text-stone-700"}>{tableStatusLabels[status] || status}</Badge>;
}

import { Link } from "react-router-dom";
import { Badge } from "./ui/Badge";
import { formatDate } from "../lib/utils";

export function CallCard({ call }) {
  const tone = call.outcome === "confirmed" ? "green" : call.outcome === "failed" ? "red" : call.outcome === "rescheduled" ? "amber" : "slate";
  return (
    <tr className="table-row group">
      <td className="px-4 py-4">
        <Link to={`/sessions/${call.id}`} className="font-medium text-foreground hover:text-primary">
          {call.patient_name}
        </Link>
        <div className="text-xs text-muted-foreground">Dr. {call.doctor_name}</div>
      </td>
      <td className="px-4 py-4"><Badge tone={call.system_type === "realtime" ? "blue" : "purple"}>{call.system_type}</Badge></td>
      <td className="px-4 py-4 text-sm text-card-foreground/75">{call.duration || 0}s</td>
      <td className="px-4 py-4"><Badge tone={tone}>{call.outcome}</Badge></td>
      <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(call.created_at)}</td>
    </tr>
  );
}

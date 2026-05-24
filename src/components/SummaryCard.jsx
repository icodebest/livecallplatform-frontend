import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function SummaryCard({ call }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-card-foreground/82">{call?.summary || "Summary will be generated after the call completes."}</p>
        <div className="flex flex-wrap gap-2">
          <Badge>{call?.outcome || "pending"}</Badge>
          {call?.sentiment && <Badge tone="green">{call.sentiment}</Badge>}
          {call?.latency_ms != null && <Badge tone="blue">{call.latency_ms}ms avg latency</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

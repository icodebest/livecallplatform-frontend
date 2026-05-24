import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";

export function TranscriptPanel({ transcript = [], activeSpeaker }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Live Transcript</CardTitle>
        {activeSpeaker && <Badge tone={activeSpeaker === "ai" ? "blue" : "green"}>{activeSpeaker}</Badge>}
      </CardHeader>
      <CardContent>
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {transcript.length === 0 && <p className="text-sm text-muted-foreground">Transcript events will appear here.</p>}
          {transcript.map((turn, index) => (
            <div key={`${turn.timestamp}-${index}`} className="surface-muted px-4 py-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{turn.speaker}</div>
              <p className="text-sm leading-6 text-card-foreground/90">{turn.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

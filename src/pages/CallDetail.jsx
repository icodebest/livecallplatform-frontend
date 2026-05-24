import { Clock, Radio, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { callsApi } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { useSocket } from "../hooks/useSocket";
import { formatDate } from "../lib/utils";

export function CallDetail() {
  const { id } = useParams();
  const [call, setCall] = useState(null);
  const [liveTurns, setLiveTurns] = useState([]);
  const [activeSpeaker, setActiveSpeaker] = useState("");
  const { messages, status } = useSocket(`/ws/calls/${id}/monitor`, Boolean(id && !id.startsWith("demo")));

  useEffect(() => {
    callsApi.get(id).then(setCall).catch(() => setCall(null));
  }, [id]);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.type === "transcript") {
        setLiveTurns((current) => [...current, { speaker: message.speaker, text: message.text, timestamp: new Date().toISOString() }]);
        setActiveSpeaker(message.speaker);
      }
      if (message.type === "latency") setActiveSpeaker(message.active_speaker);
      if (message.type === "completed") setCall(message.call);
    });
  }, [messages]);

  const transcript = useMemo(() => [...(call?.transcript || []), ...liveTurns], [call, liveTurns]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={call?.patient_name || "Call Detail"}
        description={call?.phone_number || "Loading call record"}
        actions={
          <>
            <Badge tone={status === "connected" ? "green" : "slate"}>monitor {status}</Badge>
            {call?.system_type && <Badge tone={call.system_type === "realtime" ? "blue" : "purple"}>{call.system_type}</Badge>}
            {call?.outcome && <Badge>{call.outcome}</Badge>}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Info icon={UserRound} label="Doctor" value={call?.doctor_name || "—"} />
        <Info icon={Clock} label="Created" value={formatDate(call?.created_at)} />
        <Info icon={Radio} label="Latency" value={call?.latency_ms ? `${call.latency_ms}ms` : "Streaming"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {call?.provider_error && (
            <div className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-3 text-sm leading-6 text-warning">
              <span className="font-semibold">Provider issue:</span> {call.provider_error}
            </div>
          )}
          <TranscriptPanel transcript={transcript} activeSpeaker={activeSpeaker} />
        </div>
        <SummaryCard call={call} />
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-sm font-semibold text-foreground">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

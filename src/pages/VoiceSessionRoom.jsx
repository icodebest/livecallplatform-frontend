import { Mic, MicOff, PhoneOff, Radio, Sparkles, Timer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { sessionsApi, voiceSocketUrl } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { SummaryCard } from "../components/SummaryCard";
import { TranscriptPanel } from "../components/TranscriptPanel";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export function VoiceSessionRoom() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [liveTurns, setLiveTurns] = useState([]);
  const [voiceStatus, setVoiceStatus] = useState("idle");
  const [activeSpeaker, setActiveSpeaker] = useState("");
  const [duration, setDuration] = useState(0);
  const [latency, setLatency] = useState(null);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const wsRef = useRef(null);
  const mediaRef = useRef({ stream: null, recorder: null, audioContext: null, processor: null, source: null, segmentTimer: null });
  const startedAtRef = useRef(null);
  const endingRef = useRef(false);
  useEffect(() => {
    sessionsApi.get(id).then(setSession).catch(() => setSession(null));
  }, [id]);

  useEffect(() => {
    return () => endSession({ notifyServer: false });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (startedAtRef.current && voiceStatus !== "closed") {
        setDuration(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [voiceStatus]);

  const transcript = useMemo(() => [...(session?.transcript || []), ...liveTurns], [session, liveTurns]);

  async function startVoiceSession(currentSession = session) {
    if (!currentSession || voiceStatus === "connecting" || voiceStatus === "connected") return;
    setVoiceStatus("connecting");
    setError("");
    startedAtRef.current = Date.now();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      await ensurePlaybackReady();
      mediaRef.current.stream = stream;
      const ws = new WebSocket(voiceSocketUrl(currentSession.id));
      wsRef.current = ws;
      ws.onopen = () => {
        setVoiceStatus("connected");
        currentSession.system_type === "realtime" ? startRealtimeCapture(stream, ws) : startModularCapture(stream, ws);
      };
      ws.onmessage = (event) => handleMessage(JSON.parse(event.data));
      ws.onerror = () => {
        setVoiceStatus("error");
        setError("Voice socket error. Check backend and microphone permissions.");
      };
      ws.onclose = () => {
        setVoiceStatus("closed");
        startedAtRef.current = null;
        stopLocalAudio();
      };
    } catch (err) {
      setVoiceStatus("error");
      setError("Microphone access is required to start the AI voice session.");
    }
  }

  function handleMessage(message) {
    if (message.type === "transcript") {
      setLiveTurns((current) => [...current, { speaker: message.speaker, text: message.text, timestamp: new Date().toISOString() }]);
      setActiveSpeaker(message.speaker);
    }
    if (message.type === "speaker") setActiveSpeaker(message.active_speaker);
    if (message.type === "latency") {
      setLatency(message.latency_ms);
      setActiveSpeaker(message.active_speaker);
    }
    if (message.type === "audio") playAudio(message.audio, message.format);
    if (message.type === "duration") {
      setDuration(message.duration);
      startedAtRef.current = null;
    }
    if (message.type === "completed") {
      setSession(message.session);
      setEnding(false);
      endingRef.current = false;
      setVoiceStatus("closed");
      startedAtRef.current = null;
      wsRef.current?.close();
    }
    if (message.type === "error") setError(message.message);
  }

  function startModularCapture(stream, ws) {
    const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? { mimeType: "audio/webm;codecs=opus" } : {};
    const startSegment = () => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];
      mediaRef.current.recorder = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = async () => {
        if (!chunks.length || ws.readyState !== WebSocket.OPEN) return;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 2_000) {
          ws.send(JSON.stringify({ type: "audio", audio: await blobToBase64(blob), mime_type: blob.type || "audio/webm" }));
        }
      };
      recorder.start();
    };

    startSegment();
    mediaRef.current.segmentTimer = window.setInterval(() => {
      const recorder = mediaRef.current.recorder;
      if (recorder?.state === "recording") recorder.stop();
      window.setTimeout(startSegment, 120);
    }, 4500);
  }

  async function startRealtimeCapture(stream, ws) {
    const audioContext = new AudioContext({ sampleRate: 24000 });
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const pcm = floatTo16BitPcm(event.inputBuffer.getChannelData(0));
      ws.send(JSON.stringify({ type: "audio", audio: arrayBufferToBase64(pcm.buffer) }));
    };
    source.connect(processor);
    processor.connect(audioContext.destination);
    mediaRef.current.audioContext = audioContext;
    mediaRef.current.source = source;
    mediaRef.current.processor = processor;
  }

  async function endSession({ notifyServer = true } = {}) {
    if (notifyServer && wsRef.current?.readyState === WebSocket.OPEN) {
      setEnding(true);
      endingRef.current = true;
      setVoiceStatus("ending");
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      stopLocalAudio();
      window.setTimeout(async () => {
        if (!endingRef.current) return;
        try {
          const refreshed = await sessionsApi.get(id);
          setSession(refreshed);
          setDuration(refreshed.duration || duration);
          startedAtRef.current = null;
          setVoiceStatus("closed");
          setEnding(false);
          endingRef.current = false;
          wsRef.current?.close();
        } catch {
          setError("Session is ending. Refresh in a moment if the summary does not appear.");
        }
      }, 5000);
      return;
    }
    wsRef.current?.close();
    setVoiceStatus("closed");
    setEnding(false);
    endingRef.current = false;
    startedAtRef.current = null;
    stopLocalAudio();
  }

  function stopLocalAudio() {
    const media = mediaRef.current;
    if (media.segmentTimer) window.clearInterval(media.segmentTimer);
    media.recorder?.state === "recording" && media.recorder.stop();
    media.processor?.disconnect();
    media.source?.disconnect();
    media.audioContext?.close();
    media.stream?.getTracks().forEach((track) => track.stop());
    mediaRef.current = { stream: null, recorder: null, audioContext: null, processor: null, source: null, segmentTimer: null };
  }

  return (
    <div className="page-shell">
      <PageHeader
        title={session?.patient_name || "Voice Session Room"}
        description={session ? `Dr. ${session.doctor_name} • ${session.appointment_date} ${session.appointment_time}` : "Loading session"}
        actions={<><Badge tone={voiceStatus === "connected" ? "green" : "slate"}>{voiceStatus}</Badge>{session?.system_type && <Badge tone={session.system_type === "realtime" ? "blue" : "purple"}>{session.system_type}</Badge>}</>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Info icon={Radio} label="Socket" value={voiceStatus} />
        <Info icon={Timer} label="Duration" value={formatDuration(duration)} />
        <Info icon={Sparkles} label="Speaker" value={activeSpeaker || "listening"} />
        <Info icon={Mic} label="Latency" value={latency != null ? `${latency}ms` : session?.latency_ms ? `${session.latency_ms}ms` : "live"} />
      </div>

      {error && <div className="rounded-2xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Browser microphone session</div>
                <div className="mt-1 text-sm text-muted-foreground">Maya speaks first, listens continuously, and adapts between English, Urdu, and mixed language.</div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => startVoiceSession()} disabled={voiceStatus === "connected" || voiceStatus === "connecting"}><Mic className="h-4 w-4" /> Start AI Voice</Button>
                <Button type="button" variant="secondary" onClick={() => stopLocalAudio()}><MicOff className="h-4 w-4" /> Stop Mic</Button>
                <Button type="button" onClick={() => endSession()} disabled={ending || voiceStatus === "closed"}><PhoneOff className="h-4 w-4" /> {ending ? "Ending..." : "End Session"}</Button>
              </div>
            </CardContent>
          </Card>
          <TranscriptPanel transcript={transcript} activeSpeaker={activeSpeaker} />
        </div>
        <SummaryCard call={session} />
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return <Card><CardContent className="flex items-center gap-3"><div className="rounded-2xl bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></div><div><div className="text-xs text-muted-foreground">{label}</div><div className="text-sm font-semibold text-foreground">{value}</div></div></CardContent></Card>;
}

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
}

function floatTo16BitPcm(input) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function playAudio(base64, format) {
  if (!base64) return;
  if (format === "mp3") {
    playEncodedAudio(base64, "audio/mpeg");
    return;
  }
  playPcm16(base64);
}

async function ensurePlaybackReady() {
  if (!window.__mayaPlayback) {
    window.__mayaPlayback = { context: new AudioContext({ sampleRate: 24000 }), nextStartTime: 0 };
  }
  if (window.__mayaPlayback.context.state === "suspended") {
    await window.__mayaPlayback.context.resume();
  }
  return window.__mayaPlayback;
}

async function playEncodedAudio(base64) {
  const playback = await ensurePlaybackReady();
  const bytes = base64ToUint8Array(base64);
  const audioBuffer = await playback.context.decodeAudioData(bytes.buffer.slice(0));
  scheduleBuffer(playback, audioBuffer);
}

async function playPcm16(base64) {
  const playback = await ensurePlaybackReady();
  const binary = atob(base64);
  const pcm = new Int16Array(binary.length / 2);
  for (let i = 0; i < pcm.length; i += 1) {
    pcm[i] = binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8);
  }
  const buffer = playback.context.createBuffer(1, pcm.length, 24000);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < pcm.length; i += 1) channel[i] = pcm[i] / 32768;
  scheduleBuffer(playback, buffer);
}

function scheduleBuffer(playback, buffer) {
  const source = playback.context.createBufferSource();
  source.buffer = buffer;
  source.connect(playback.context.destination);
  const startAt = Math.max(playback.context.currentTime + 0.02, playback.nextStartTime || 0);
  source.start(startAt);
  playback.nextStartTime = startAt + buffer.duration;
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

import { useEffect, useRef, useState } from "react";
import { WS_BASE_URL } from "../api/client";

export function useSocket(path, enabled = true) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const wsRef = useRef(null);

  useEffect(() => {
    if (!enabled || !path) return undefined;
    const ws = new WebSocket(`${WS_BASE_URL}${path}`);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => setStatus("connected");
    ws.onmessage = (event) => setMessages((items) => [...items, JSON.parse(event.data)]);
    ws.onerror = () => setStatus("error");
    ws.onclose = () => setStatus("closed");

    return () => ws.close();
  }, [path, enabled]);

  return { messages, status, send: (message) => wsRef.current?.send(JSON.stringify(message)) };
}

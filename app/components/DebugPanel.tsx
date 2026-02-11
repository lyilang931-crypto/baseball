"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import type { DebugEvent } from "@/lib/analytics";

export default function DebugPanel() {
  const searchParams = useSearchParams();
  const enabled = searchParams.get("debug_panel") !== null;
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gtagOk, setGtagOk] = useState(false);

  const sync = useCallback(() => {
    setEvents([...(window.__lastEvents ?? [])]);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    sync();
    setGtagOk(typeof window.gtag === "function");
    const handler = () => {
      sync();
      setGtagOk(typeof window.gtag === "function");
    };
    window.addEventListener("__debug_event", handler);
    return () => window.removeEventListener("__debug_event", handler);
  }, [enabled, sync]);

  if (!enabled) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = JSON.stringify(events, null, 2);
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleClear = () => {
    window.__lastEvents = [];
    setEvents([]);
  };

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("ja-JP", { hour12: false }) + "." + String(d.getMilliseconds()).padStart(3, "0");
  };

  const shortParams = (params: Record<string, unknown>) => {
    const keys = ["mode", "question_id", "session_id", "placement", "streak_days", "correct_count"];
    const parts: string[] = [];
    for (const k of keys) {
      if (k in params) {
        const v = params[k];
        if (k === "session_id" && typeof v === "string") {
          parts.push(`${k}:${v.slice(0, 8)}..`);
        } else {
          parts.push(`${k}:${v}`);
        }
      }
    }
    return parts.join(" | ");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 8,
        right: 8,
        zIndex: 99999,
        width: collapsed ? "auto" : 340,
        maxHeight: collapsed ? "auto" : "50vh",
        background: "rgba(0,0,0,0.92)",
        color: "#e0e0e0",
        borderRadius: 8,
        fontSize: 11,
        fontFamily: "monospace",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 10px",
          borderBottom: collapsed ? "none" : "1px solid #333",
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ fontWeight: "bold", color: "#4285f4" }}>
          GA4 Debug ({events.length})
        </span>
        <span style={{ color: "#888" }}>{collapsed ? "+" : "-"}</span>
      </div>

      {!collapsed && (
        <>
          {/* Events list */}
          <div style={{ overflowY: "auto", flex: 1, padding: "4px 0" }}>
            {events.length === 0 && (
              <div style={{ padding: "8px 10px", color: "#666" }}>
                No events yet
              </div>
            )}
            {[...events].reverse().map((ev, i) => (
              <div
                key={`${ev.timestamp}-${i}`}
                style={{
                  padding: "4px 10px",
                  borderBottom: "1px solid #222",
                }}
              >
                <div>
                  <span style={{ color: "#81c784", fontWeight: "bold" }}>
                    {ev.eventName}
                  </span>
                  <span style={{ color: "#666", marginLeft: 6 }}>
                    {fmtTime(ev.timestamp)}
                  </span>
                </div>
                <div style={{ color: "#aaa", fontSize: 10, marginTop: 2 }}>
                  {shortParams(ev.params)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer buttons */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "6px 10px",
              borderTop: "1px solid #333",
            }}
          >
            <button
              type="button"
              onClick={handleCopy}
              style={{
                flex: 1,
                padding: "4px 8px",
                background: copied ? "#388e3c" : "#333",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: "4px 8px",
                background: "#333",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              Clear
            </button>
          </div>

          {/* gtag status */}
          <div
            style={{
              padding: "4px 10px 6px",
              fontSize: 10,
              color: gtagOk ? "#81c784" : "#ef5350",
            }}
          >
            gtag: {gtagOk ? "OK" : "NOT LOADED"}
          </div>
        </>
      )}
    </div>
  );
}

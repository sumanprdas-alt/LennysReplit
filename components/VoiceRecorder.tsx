"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [rawText, setRawText] = useState("");
  const [showCleanup, setShowCleanup] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>("");

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    fullTranscriptRef.current = "";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      fullTranscriptRef.current = transcript;
      setRawText(transcript);
    };

    recognition.onerror = () => { stopRecording(); };
    recognition.onend = () => {
      // Auto-restart if still in recording mode
      if (recognitionRef.current && isRecording) {
        try { recognitionRef.current.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setRawText("");
    setShowCleanup(false);
  };

  const stopRecording = () => {
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    if (fullTranscriptRef.current.trim()) {
      setRawText(fullTranscriptRef.current);
      setShowCleanup(true);
    }
  };

  const cleanupText = async () => {
    setCleaning(true);
    try {
      const res = await fetch("/api/sage/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      const data = await res.json();
      const cleaned = data.cleaned || rawText;
      setRawText(cleaned);
      onTranscript(cleaned);
      setShowCleanup(false);
    } catch {
      // If cleanup API fails, just use raw text
      onTranscript(rawText);
      setShowCleanup(false);
    }
    setCleaning(false);
  };

  const useAsIs = () => {
    onTranscript(rawText);
    setShowCleanup(false);
    setRawText("");
  };

  // Cleanup modal
  if (showCleanup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
        <div className="w-full max-w-[480px] mx-4 rounded-xl p-6" style={{ background: "var(--bg2)", border: "1px solid var(--border2)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] tracking-[1px]" style={{ color: "var(--ac)" }}>VOICE TRANSCRIPT</p>
            <button onClick={() => { setShowCleanup(false); setRawText(""); }} className="text-sm cursor-pointer" style={{ color: "var(--t4)", background: "none", border: "none" }}>✕</button>
          </div>
          <textarea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            className="w-full h-[120px] px-4 py-3 rounded-lg text-[13px] outline-none resize-none leading-relaxed"
            style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--t1)" }}
          />
          <p className="text-[11px] mt-2 mb-4" style={{ color: "var(--t4)" }}>Edit the text above, or let the Sage clean it up for you.</p>
          <div className="flex gap-2">
            <button onClick={cleanupText} disabled={cleaning} className="flex-1 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer disabled:opacity-50" style={{ background: "var(--ac)", color: "var(--bg)" }}>
              {cleaning ? "Cleaning up..." : "✨ Clean up text"}
            </button>
            <button onClick={useAsIs} className="flex-1 py-2.5 rounded-lg text-[12px] font-medium cursor-pointer" style={{ border: "1px solid var(--border2)", color: "var(--t3)" }}>
              Use as is →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isRecording && (
        <span className="text-[11px] animate-pulse" style={{ color: "var(--red)" }}>● Recording...</span>
      )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        title={isRecording ? "Stop recording" : "Voice input"}
        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all"
        style={{
          background: isRecording ? "var(--red)" : "var(--bg3)",
          border: `1px solid ${isRecording ? "var(--red)" : "var(--border)"}`,
          color: isRecording ? "var(--t1)" : "var(--t4)",
        }}
      >
        {isRecording ? "■" : "🎤"}
      </button>
    </div>
  );
}

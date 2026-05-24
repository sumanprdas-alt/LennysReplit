"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>("");

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input not supported in this browser."); return; }

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
    };

    recognition.onerror = () => { stopRecording(); };
    recognition.onend = () => {
      if (recognitionRef.current && isRecording) {
        try { recognitionRef.current.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;

    const raw = fullTranscriptRef.current.trim();
    if (!raw) return;

    // Auto-cleanup via API
    setIsCleaning(true);
    try {
      const res = await fetch("/api/sage/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      const data = await res.json();
      onTranscript(data.cleaned || raw);
    } catch {
      onTranscript(raw);
    }
    setIsCleaning(false);
  };

  return (
    <div className="flex items-center gap-2">
      {isRecording && <span className="text-[12px] animate-pulse" style={{ color: "var(--red)" }}>● Listening...</span>}
      {isCleaning && <span className="text-[12px]" style={{ color: "var(--ac)" }}>✨ Cleaning up...</span>}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isCleaning}
        title={isRecording ? "Stop recording" : "Voice input"}
        className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all disabled:opacity-50"
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

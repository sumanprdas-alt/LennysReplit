"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export default function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lastTranscriptRef = useRef<string>("");

  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Only send if different from last transcript (prevents repetition)
      if (transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = transcript;
        onTranscript(transcript);
      }
    };

    recognition.onerror = () => { setIsRecording(false); };
    recognition.onend = () => { setIsRecording(false); };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? "Stop recording" : "Voice input"}
      className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
      style={{
        background: isRecording ? "var(--red)" : "var(--bg3)",
        border: `1px solid ${isRecording ? "var(--red)" : "var(--border)"}`,
        color: isRecording ? "var(--t1)" : "var(--t4)",
      }}
    >
      {isRecording ? "■" : "🎤"}
    </button>
  );
}

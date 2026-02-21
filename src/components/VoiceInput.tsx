import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Square } from "lucide-react";

interface VoiceInputProps {
  onResult: (text: string) => void;
  isListening: boolean;
  onToggle: () => void;
}

const VoiceInput = ({ onResult, isListening, onToggle }: VoiceInputProps) => {
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "hi-IN"; // Supports Hinglish

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onerror = () => {
      onToggle();
    };

    recognition.onend = () => {
      if (isListening) onToggle();
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try { recognitionRef.current.start(); } catch {}
    } else {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, [isListening]);

  if (!supported) return null;

  return (
    <motion.button
      onClick={onToggle}
      className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors ${
        isListening
          ? "border-primary bg-primary/20 animate-mic-glow"
          : "border-border bg-secondary hover:border-primary/50"
      }`}
      whileTap={{ scale: 0.9 }}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
    >
      {isListening ? (
        <>
          <Square className="h-5 w-5 text-primary" />
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{ scale: [1, 2], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      ) : (
        <Mic className="h-5 w-5 text-muted-foreground" />
      )}
    </motion.button>
  );
};

export default VoiceInput;
